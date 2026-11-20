package com.example.Help.Service;

import com.example.Help.model.usuario.*;
import com.example.Help.model.recuperacao.TokenRecuperacao;
import com.example.Help.model.recuperacao.TokenRecuperacaoRepository;
import com.example.Help.model.login.LoginRequestDTO;
import com.example.Help.model.empresa.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;

@Service
public class UsuarioService {

    private static final Logger logger = Logger.getLogger(UsuarioService.class.getName());
    private static final long TOKEN_EXPIRACAO_MINUTOS = 15;
    private static final SecureRandom RANDOM = new SecureRandom();

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenRecuperacaoRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    public UsuarioResponseDTO realizarLogin(LoginRequestDTO data) { //login
        Usuario usuario = repository.findByEmailIgnoreCase(Usuario.normalizarEmail(data.email()))
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));

        if (passwordEncoder.matches(data.password(), usuario.getPassword())) {
            return new UsuarioResponseDTO(
                    usuario.getId(),
                    usuario.getName(),
                    usuario.getEmail(),
                    usuario.getTelefone(),
                    usuario.getCidade(),
                    usuario.getEstado(),
                    usuario.getCargo(),
                    usuario.getCurriculo(),
                    usuario.getSkills(),
                    usuario.getSalarioBase()
            );
        }
        throw new RuntimeException("Senha incorreta!");
    }

    /** A resposta externa é idêntica para contas existentes e inexistentes. */
    @Transactional
    public void gerarTokenRecuperacao(String email) {
        if (!emailService.configurado())
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "O envio de e-mail está temporariamente indisponível.");
        String normalizado = Usuario.normalizarEmail(email);
        if (normalizado == null || normalizado.isBlank()) return;
        var conta = repository.findByEmailIgnoreCase(normalizado);
        if (conta.isEmpty() || !conta.get().isAtivo()) return;
        Usuario usuario = conta.get();
        TokenRecuperacao registro = tokenRepository.buscarPorEmailComBloqueio(normalizado).orElse(null);
        if (registro != null && registro.getEnviadoEm() != null &&
                registro.getEnviadoEm().isAfter(LocalDateTime.now().minusSeconds(60))) return;
        byte[] bytes = new byte[12];
        RANDOM.nextBytes(bytes);
        String codigo = HexFormat.of().withUpperCase().formatHex(bytes);
        if (registro == null) registro = new TokenRecuperacao();
        registro.setUsuario(usuario);
        registro.setToken(hashRecuperacao(usuario, codigo));
        registro.setDataExpiracao(LocalDateTime.now().plusMinutes(TOKEN_EXPIRACAO_MINUTOS));
        registro.setEnviadoEm(LocalDateTime.now());
        registro.setTentativas(0);
        tokenRepository.save(registro);
        try {
            emailService.enviarTexto(usuario.getEmail(), "Recuperação de senha — Help",
                    "Seu código de recuperação é: " + codigo + ". Ele expira em 15 minutos.");
        } catch (RuntimeException e) {
            tokenRepository.delete(registro);
            logger.warning("Não foi possível enviar um código de recuperação.");
        }
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public void redefinirSenhaComToken(String email, String codigo, String novaSenha) {
        String normalizado = Usuario.normalizarEmail(email);
        if (normalizado == null || normalizado.isBlank() || codigo == null || novaSenha == null ||
                !novaSenha.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,128}$"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados ou senha inválidos.");
        TokenRecuperacao registro = tokenRepository.buscarPorEmailComBloqueio(normalizado)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código inválido ou expirado."));
        if (registro.getTentativas() >= 5 || registro.getDataExpiracao().isBefore(LocalDateTime.now()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código inválido ou expirado.");
        registro.setTentativas(registro.getTentativas() + 1);
        String recebido = codigo.trim().toUpperCase();
        boolean valido = recebido.matches("[0-9A-F]{24}") && MessageDigest.isEqual(
                registro.getToken().getBytes(StandardCharsets.UTF_8),
                hashRecuperacao(registro.getUsuario(), recebido).getBytes(StandardCharsets.UTF_8));
        if (!valido) {
            tokenRepository.save(registro);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código inválido ou expirado.");
        }
        Usuario usuario = registro.getUsuario();
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuario.setSessionVersion(UUID.randomUUID().toString());
        repository.save(usuario);
        tokenRepository.delete(registro);
    }

    private String hashRecuperacao(Usuario usuario, String codigo) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest((usuario.getId() + ":" + codigo).getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }

    @Transactional //crud usuario
    public void salvar(UsuarioRequestDTO data) {
        String email = Usuario.normalizarEmail(data.email());
        if (repository.existsByEmailIgnoreCase(email) || empresaRepository.existsByEmailIgnoreCase(email))
            throw new RuntimeException("E-mail já cadastrado.");

        Usuario u = new Usuario();
        u.setName(data.name());
        u.setEmail(email);
        u.setSenha(passwordEncoder.encode(data.password()));
        u.setCargo(data.jobRole());
        u.setCidade(data.userLocation());
        u.setSkills(data.skills());
        repository.save(u);
    }

    public List<UsuarioResponseDTO> listarTodos() {
        return repository.findAll().stream()
                .map(usuario -> new UsuarioResponseDTO(
                        usuario.getId(),
                        usuario.getName(),
                        usuario.getEmail(),
                        usuario.getTelefone(),
                        usuario.getCidade(),
                        usuario.getEstado(),
                        usuario.getCargo(),
                        usuario.getCurriculo(),
                        usuario.getSkills(),
                        usuario.getSalarioBase()
                ))
                .toList();
    }

    @Transactional
    public void atualizarPerfil(UUID id, UsuarioRequestDTO data) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
        usuario.setName(data.name());
        repository.save(usuario);
    }

}

package com.example.Help.Service;

import com.example.Help.model.usuario.*;
import com.example.Help.model.recuperacao.TokenRecuperacao;
import com.example.Help.model.recuperacao.TokenRecuperacaoRepository;
import com.example.Help.model.login.LoginRequestDTO;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;

@Service
public class UsuarioService {

    private static final Logger logger = Logger.getLogger(UsuarioService.class.getName());
    private static final long TOKEN_EXPIRACAO_MINUTOS = 5;

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenRecuperacaoRepository tokenRepository;

    @Autowired
    private JavaMailSender mailSender;

    public UsuarioResponseDTO realizarLogin(LoginRequestDTO data) { //login
        Usuario usuario = repository.findByEmail(data.email())
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

    @Transactional //recuperar senha
    public void gerarTokenRecuperacao(String email) {
        Usuario usuario = buscarUsuarioPorEmail(email);
        String token = prepararNovoToken(usuario);
        enviarEmailRecuperacaoSenha(usuario, token);
        logger.info("Token de recuperação de senha gerado para: " + email);
    }

    @Transactional
    public void redefinirSenhaComToken(String token, String novaSenha) {
        TokenRecuperacao tokenEncontrado = buscarTokenOuFalhar(token);
        verificarExpiracaoEDeletar(tokenEncontrado, "O código de recuperação de senha expirou.");

        Usuario usuario = tokenEncontrado.getUsuario();
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        repository.save(usuario);
        tokenRepository.delete(tokenEncontrado);

        logger.info("Senha redefinida com sucesso para: " + usuario.getEmail());
    }

    @Transactional //crud usuario
    public void salvar(UsuarioRequestDTO data) {
        if (repository.existsByEmail(data.email()))
            throw new RuntimeException("E-mail já cadastrado.");

        Usuario u = new Usuario();
        u.setName(data.name());
        u.setEmail(data.email());
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

    private Usuario buscarUsuarioPorEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
    }

    private TokenRecuperacao buscarTokenOuFalhar(String token) {
        return tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Código inválido ou inexistente."));
    }

    private String prepararNovoToken(Usuario usuario) {
        tokenRepository.deleteByUsuario(usuario);
        tokenRepository.flush();

        String token = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        TokenRecuperacao novoToken = new TokenRecuperacao(
                token, usuario, LocalDateTime.now().plusMinutes(TOKEN_EXPIRACAO_MINUTOS)
        );
        tokenRepository.save(novoToken);
        return token;
    }

    private void verificarExpiracaoEDeletar(TokenRecuperacao token, String mensagemErro) {
        if (token.getDataExpiracao().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(token);
            throw new RuntimeException(mensagemErro);
        }
    }

    @Async //emails
    protected void enviarMimeMessage(String para, String assunto, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom("suportesistemahelp@gmail.com", "Help Academy");
            helper.setTo(para);
            helper.setSubject(assunto);
            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            logger.severe("Erro ao enviar e-mail: " + e.getMessage());
        }
    }

    private void enviarEmailRecuperacaoSenha(Usuario usuario, String token) {
        String html = String.format("""
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
                <h2 style="color:#ef4444;margin-top:0;">🔐 Recuperação de Senha</h2>
                <p>Olá, <strong>%s</strong>!</p>
                <p>Use o código abaixo para redefinir sua senha:</p>
                <div style="background:#1f2937;color:#f87171;padding:16px;font-size:28px;font-weight:bold;text-align:center;border-radius:8px;letter-spacing:6px;">
                    %s
                </div>
                <p style="color:#6b7280;font-size:13px;margin-top:16px;">⚠️ Expira em %d minutos.</p>
            </div>
            """, usuario.getName(), token, TOKEN_EXPIRACAO_MINUTOS);
        enviarMimeMessage(usuario.getEmail(), "Recuperação de Senha — Help Academy", html);
    }
}
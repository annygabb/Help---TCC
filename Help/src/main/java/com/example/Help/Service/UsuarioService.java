package com.example.Help.Service;

import com.example.Help.model.usuario.*;
import com.example.Help.model.recuperacao.TokenRecuperacao;
import com.example.Help.model.recuperacao.TokenRecuperacaoRepository;
import com.example.Help.model.login.LoginRequestDTO;
import com.example.Help.model.curso.Curso;
import com.example.Help.model.curso.CursoRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenRecuperacaoRepository tokenRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Transactional
    public void salvar(UsuarioRequestDTO data) {
        if (repository.existsByEmail(data.email())) {
            throw new RuntimeException("E-mail já cadastrado no sistema.");
        }

        Usuario usuarioData = new Usuario(data);
        String senhaCriptografada = passwordEncoder.encode(data.password());
        usuarioData.setSenha(senhaCriptografada);

        repository.save(usuarioData);
    }

    public List<UsuarioResponseDTO> listarTodos() {
        return repository.findAll().stream()
                .map(UsuarioResponseDTO::new)
                .toList();
    }

    public UsuarioResponseDTO realizarLogin(LoginRequestDTO data) {
        Usuario usuario = repository.findByEmail(data.email())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));

        if (passwordEncoder.matches(data.password(), usuario.getPassword())) {
            return new UsuarioResponseDTO(usuario);
        } else {
            throw new RuntimeException("Senha incorreta!");
        }
    }

    @Transactional
    public void atualizarPerfil(UUID id, UsuarioRequestDTO data) {
        Usuario usuarioExistente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado para atualização."));

        usuarioExistente.setName(data.full_name());
        usuarioExistente.setJobRole(data.job_role());
        usuarioExistente.setBio(data.user_bio());
        usuarioExistente.setLocation(data.user_location());

        repository.save(usuarioExistente);
    }

    public List<Curso> listarCursosDoUsuario(UUID usuarioId) {
        return cursoRepository.findByAlunoId(usuarioId);
    }

    @Transactional
    public String gerarTokenRecuperacao(String email) {
        Usuario usuario = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        tokenRepository.deleteByUsuario(usuario);
        tokenRepository.flush();

        String tokenuuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        TokenRecuperacao novoToken = new TokenRecuperacao(tokenuuid, usuario);
        tokenRepository.save(novoToken);

        enviarEmailRecuperacao(usuario, tokenuuid);

        return tokenuuid;
    }

    private void enviarEmailRecuperacao(Usuario usuario, String token) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "utf-8");

            String nomeExibicao = usuario.getName();
            if (nomeExibicao == null || nomeExibicao.isBlank() || nomeExibicao.contains("@")) {
                String prefixo = usuario.getEmail().split("@")[0];
                nomeExibicao = prefixo.substring(0, 1).toUpperCase() + prefixo.substring(1).toLowerCase();
            }

            String htmlMsg = "<div style='font-family: sans-serif; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>" +
                    "<h2 style='color: #4A90E2;'>Olá, " + nomeExibicao + "!</h2>" +
                    "<p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Help</strong>.</p>" +
                    "<p>Seu código de recuperação é: <span style='font-size: 20px; font-weight: bold; color: #E94E77;'>" + token + "</span></p>" +
                    "<p>Se você não solicitou isso, ignore este e-mail.</p>" +
                    "<br><p>Equipe Help</p></div>";

            helper.setFrom("suportesistemahelp@gmail.com");
            helper.setTo(usuario.getEmail());
            helper.setSubject("Recuperação de Senha - Help");
            helper.setText(htmlMsg, true);

            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Erro ao enviar e-mail: " + e.getMessage());
        }
    }

    @Transactional
    public void redefinirSenhaComToken(String token, String novaSenha) {
        TokenRecuperacao tokenEncontrado = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido ou expirado."));

        if (tokenEncontrado.getDataExpiracao().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(tokenEncontrado);
            throw new RuntimeException("Este código de recuperação expirou.");
        }

        Usuario usuario = tokenEncontrado.getUsuario();
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        repository.save(usuario);

        tokenRepository.delete(tokenEncontrado);
    }
}
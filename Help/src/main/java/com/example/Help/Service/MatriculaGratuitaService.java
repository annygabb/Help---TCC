package com.example.Help.Service;

import com.example.Help.model.curso.MatriculaGratuita;
import com.example.Help.model.curso.MatriculaGratuitaRepository;
import com.example.Help.model.usuario.Usuario;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

@Service
public class MatriculaGratuitaService {
    private static final Map<String, String> CURSOS = Map.of("java-spring-boot", "Java Spring Boot Profissional");
    private final MatriculaGratuitaRepository repository;
    private final JavaMailSender mailSender;
    private final SecureRandom random = new SecureRandom();

    public MatriculaGratuitaService(MatriculaGratuitaRepository repository, JavaMailSender mailSender) {
        this.repository = repository;
        this.mailSender = mailSender;
    }

    @Transactional
    public void solicitar(Usuario usuario, String codigoCurso) {
        String nomeCurso = nomeCurso(codigoCurso);
        MatriculaGratuita matricula = repository.buscarComBloqueio(usuario.getId(), codigoCurso)
                .orElseGet(() -> new MatriculaGratuita(usuario.getId(), codigoCurso));
        if (matricula.isConfirmada()) throw new ResponseStatusException(HttpStatus.CONFLICT, "Você já está matriculado neste curso.");
        if (matricula.getSolicitadoEm() != null && matricula.getSolicitadoEm().isAfter(LocalDateTime.now().minusSeconds(60)))
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Aguarde um minuto antes de solicitar outro código.");
        String codigo = String.format("%08d", random.nextInt(100_000_000));
        matricula.setCodigoHash(hash(usuario, codigoCurso, codigo));
        matricula.setExpiraEm(LocalDateTime.now().plusMinutes(15));
        matricula.setSolicitadoEm(LocalDateTime.now());
        matricula.setTentativas(0);
        repository.saveAndFlush(matricula);
        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setFrom("suportesistemahelp@gmail.com");
        mensagem.setTo(usuario.getEmail());
        mensagem.setSubject("Confirme sua matrícula no Help");
        mensagem.setText("Seu código para confirmar a matrícula em " + nomeCurso + " é: " + codigo + ". Ele expira em 15 minutos.");
        try { mailSender.send(mensagem); }
        catch (RuntimeException ex) { throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Não foi possível enviar o código por e-mail. Tente novamente.", ex); }
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public void confirmar(Usuario usuario, String codigoCurso, String codigo) {
        nomeCurso(codigoCurso);
        MatriculaGratuita matricula = repository.buscarComBloqueio(usuario.getId(), codigoCurso)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solicite um código antes de confirmar."));
        if (matricula.isConfirmada()) return;
        if (matricula.getExpiraEm() == null || matricula.getExpiraEm().isBefore(LocalDateTime.now()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código expirado. Solicite outro.");
        if (matricula.getTentativas() >= 5)
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Limite de tentativas atingido. Solicite outro código.");
        matricula.setTentativas(matricula.getTentativas() + 1);
        boolean valido = codigo != null && codigo.matches("\\d{8}") && matricula.getCodigoHash() != null &&
                MessageDigest.isEqual(matricula.getCodigoHash().getBytes(StandardCharsets.UTF_8), hash(usuario, codigoCurso, codigo).getBytes(StandardCharsets.UTF_8));
        if (!valido) { repository.save(matricula); throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código inválido."); }
        matricula.setConfirmada(true);
        matricula.setCodigoHash(null);
        matricula.setExpiraEm(null);
        repository.save(matricula);
    }

    @Transactional(readOnly = true)
    public List<Map<String, String>> minhas(Usuario usuario) {
        return repository.findByUsuarioIdAndConfirmadaTrue(usuario.getId()).stream()
                .map(m -> Map.of("codigo", m.getCursoCodigo(), "titulo", nomeCurso(m.getCursoCodigo())))
                .toList();
    }

    private String nomeCurso(String codigo) {
        String nome = CURSOS.get(codigo);
        if (nome == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso gratuito não encontrado.");
        return nome;
    }

    private String hash(Usuario usuario, String curso, String codigo) {
        try {
            byte[] dados = (usuario.getId() + ":" + curso + ":" + codigo).getBytes(StandardCharsets.UTF_8);
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(dados));
        } catch (NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
    }
}

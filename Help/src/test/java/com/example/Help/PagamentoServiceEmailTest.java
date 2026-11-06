package com.example.Help;

import com.example.Help.Service.PagamentoService;
import com.example.Help.model.recuperacao.TokenRecuperacaoRepository;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PagamentoServiceEmailTest {

    @Test
    void naoConfirmaEnvioDoTokenQuandoSmtpFalha() {
        UsuarioRepository usuarios = mock(UsuarioRepository.class);
        TokenRecuperacaoRepository tokens = mock(TokenRecuperacaoRepository.class);
        JavaMailSender email = mock(JavaMailSender.class);
        MimeMessage mensagem = mock(MimeMessage.class);

        Usuario usuario = new Usuario();
        usuario.setName("Ana Clara");
        usuario.setEmail("ana@example.com");
        when(usuarios.findByEmail("ana@example.com")).thenReturn(Optional.of(usuario));
        when(email.createMimeMessage()).thenReturn(mensagem);
        org.mockito.Mockito.doThrow(new MailAuthenticationException("credencial inválida"))
                .when(email).send(any(MimeMessage.class));

        PagamentoService service = new PagamentoService();
        ReflectionTestUtils.setField(service, "usuarioRepository", usuarios);
        ReflectionTestUtils.setField(service, "tokenRepository", tokens);
        ReflectionTestUtils.setField(service, "mailSender", email);

        assertThrows(IllegalStateException.class,
                () -> service.gerarTokenMatricula("ana@example.com", "Java Spring"));
        verify(tokens, never()).save(any());
    }
}

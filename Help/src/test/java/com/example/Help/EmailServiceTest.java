package com.example.Help;

import com.example.Help.Service.EmailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmailServiceTest {
    @Test void producaoSemChaveNaoUsaSmtpSilenciosamente() {
        JavaMailSender smtp = mock(JavaMailSender.class);
        EmailService servico = new EmailService(smtp, new ObjectMapper(), "resend", "", "");
        assertThat(servico.configurado()).isFalse();
        assertThatThrownBy(() -> servico.enviarTexto("teste@example.invalid", "Assunto", "Mensagem"))
                .isInstanceOf(IllegalStateException.class);
        verifyNoInteractions(smtp);
    }
    @Test void ambienteLocalPodeUsarSmtp() {
        JavaMailSender smtp = mock(JavaMailSender.class);
        EmailService servico = new EmailService(smtp, new ObjectMapper(), "smtp", "", "");
        assertThat(servico.configurado()).isTrue();
        servico.enviarTexto("teste@example.invalid", "Assunto", "Mensagem");
        verify(smtp).send(any(SimpleMailMessage.class));
    }
}

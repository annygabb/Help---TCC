package com.example.Help.integracao;

import com.example.Help.suporte.IntegracaoBase;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import java.util.regex.Pattern;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class MatriculaGratuitaTest extends IntegracaoBase {
    @MockitoBean private JavaMailSender email;

    @Test
    void confirmaERecuperaMatriculaSemUsarOutroCodigoOuOutraConta() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        String base = "/matriculas/gratuitas/java-spring-boot";
        postComo(ana, base + "/solicitar", "{}").andExpect(status().isOk());
        ArgumentCaptor<SimpleMailMessage> mensagem = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(email).send(mensagem.capture());
        assertThat(mensagem.getValue().getTo()).containsExactly(ana.email());
        var codigo = Pattern.compile("\\b\\d{8}\\b").matcher(mensagem.getValue().getText());
        assertThat(codigo.find()).isTrue();
        String corpo = "{\"codigo\":\"" + codigo.group() + "\"}";
        postComo(bruno, base + "/confirmar", corpo).andExpect(status().isBadRequest());
        postComo(ana, base + "/confirmar", "{\"codigo\":\"00000000\"}")
                .andExpect(codigo.group().equals("00000000") ? status().isOk() : status().isBadRequest());
        postComo(ana, base + "/confirmar", corpo).andExpect(status().isOk());
        getComo(ana, "/matriculas/gratuitas/minhas").andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codigo").value("java-spring-boot"));
        getComo(bruno, "/matriculas/gratuitas/minhas").andExpect(jsonPath("$.length()").value(0));
        postComo(ana, "/matriculas/gratuitas/curso-pago/solicitar", "{}").andExpect(status().isNotFound());
    }
}

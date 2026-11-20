package com.example.Help.integracao;

import com.example.Help.Service.EmailService;
import com.example.Help.model.recuperacao.TokenRecuperacaoRepository;
import com.example.Help.suporte.IntegracaoBase;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class RecuperacaoEMatriculaTest extends IntegracaoBase {
    @MockitoBean private EmailService email;
    @Autowired private TokenRecuperacaoRepository tokens;

    @org.junit.jupiter.api.BeforeEach void configurarEmail() {
        org.mockito.Mockito.lenient().when(email.configurado()).thenReturn(true);
    }

    private void pedir(String endereco) throws Exception {
        mockMvc.perform(post("/api/usuarios/gerar-token").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\"}".formatted(endereco))).andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Se o e-mail estiver cadastrado, você receberá um código."));
    }
    private String codigoEnviado() {
        ArgumentCaptor<String> texto = ArgumentCaptor.forClass(String.class);
        verify(email).enviarTexto(anyString(), anyString(), texto.capture());
        var m = java.util.regex.Pattern.compile("[0-9A-F]{24}").matcher(texto.getValue());
        assertThat(m.find()).isTrue();
        return m.group();
    }
    private org.springframework.test.web.servlet.ResultActions redefinir(String endereco, String codigo) throws Exception {
        return mockMvc.perform(post("/usuarios/redefinir-senha").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"token\":\"%s\",\"novaSenha\":\"NovaSenha1\"}".formatted(endereco,codigo)));
    }
    @Test void respostaNaoRevelaConta() throws Exception {
        pedir("naoexiste@help.invalid");
        Conta ana = novoUsuario("Ana");
        pedir(ana.email());
    }
    @Test void codigoVinculadoAoEmailEServeUmaVez() throws Exception {
        Conta ana = novoUsuario("Ana");
        pedir(ana.email());
        String codigo = codigoEnviado();
        assertThat(tokens.findAll()).noneMatch(t -> codigo.equals(t.getToken()));
        redefinir("outra@help.invalid", codigo).andExpect(status().isBadRequest());
        redefinir(ana.email(), codigo).andExpect(status().isOk());
        redefinir(ana.email(), codigo).andExpect(status().isBadRequest());
        mockMvc.perform(post("/api/usuarios/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"password\":\"NovaSenha1\"}".formatted(ana.email())))
                .andExpect(status().isOk());
    }
    @Test void bloqueiaAposCincoErros() throws Exception {
        Conta ana = novoUsuario("Ana"); pedir(ana.email()); String codigo = codigoEnviado();
        for(int i=0;i<5;i++) redefinir(ana.email(), "000000000000000000000000").andExpect(status().isBadRequest());
        redefinir(ana.email(), codigo).andExpect(status().isBadRequest());
    }
    @Test void rotasLegadasNaoSaoPublicas() throws Exception {
        mockMvc.perform(post("/api/pagamento/pix").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/matricula/gerar-token").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }
}

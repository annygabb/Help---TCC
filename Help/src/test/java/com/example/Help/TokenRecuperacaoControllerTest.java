package com.example.Help;

import com.example.Help.Service.UsuarioService;
import com.example.Help.model.recuperacao.TokenRecuperacaoController;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Map;
import java.util.UUID;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TokenRecuperacaoController.class)
@DisplayName("Testes do TokenRecuperacaoController")
class TokenRecuperacaoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UsuarioService usuarioService;

    @Test
    @DisplayName("POST /auth/esqueci-senha - deve retornar 200 para e-mail dinâmico válido")
    void solicitarRecuperacao_deveRetornar200_quandoEmailValido() throws Exception {
        String emailDinamico = "user_" + UUID.randomUUID() + "@teste.com";
        Map<String, String> request = Map.of("email", emailDinamico);

        doNothing().when(usuarioService).gerarTokenRecuperacao(anyString());

        mockMvc.perform(post("/auth/esqueci-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Código de recuperação gerado com sucesso!"));

        verify(usuarioService, times(1)).gerarTokenRecuperacao(emailDinamico);
    }

    @Test
    @DisplayName("POST /auth/esqueci-senha - deve retornar 400 quando e-mail não é encontrado")
    void solicitarRecuperacao_deveRetornar400_quandoEmailNaoEncontrado() throws Exception {
        String emailNaoExistente = "nao_existe_" + UUID.randomUUID() + "@teste.com";
        Map<String, String> request = Map.of("email", emailNaoExistente);

        doThrow(new RuntimeException("Usuário não encontrado"))
                .when(usuarioService).gerarTokenRecuperacao(emailNaoExistente);

        mockMvc.perform(post("/auth/esqueci-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Usuário não encontrado"));
    }

    @Test
    @DisplayName("POST /auth/redefinir-senha - deve retornar 200 com senha forte válida")
    void redefinirSenha_deveRetornar200_quandoSenhaForteValida() throws Exception {
        Map<String, String> request = Map.of(
                "token", UUID.randomUUID().toString().substring(0, 6),
                "novaSenha", "Senha@123Valida" // Max 15 chars, Maiúscula, minúscula, especial e número
        );

        doNothing().when(usuarioService).redefinirSenhaComToken(anyString(), anyString());

        mockMvc.perform(post("/auth/redefinir-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Senha alterada com sucesso!"));
    }

    @Test
    @DisplayName("POST /auth/redefinir-senha - deve retornar 400 quando senha excede 15 caracteres")
    void redefinirSenha_deveRetornar400_quandoSenhaMuitoLonga() throws Exception {
        Map<String, String> request = Map.of(
                "token", "ABC123",
                "novaSenha", "SenhaMuitoLonga@2026Excedente"
        );

        doThrow(new RuntimeException("A senha deve ter no máximo 15 caracteres."))
                .when(usuarioService).redefinirSenhaComToken(anyString(), anyString());

        mockMvc.perform(post("/auth/redefinir-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("A senha deve ter no máximo 15 caracteres."));
    }

    @Test
    @DisplayName("POST /auth/redefinir-senha - deve retornar 400 quando falta complexidade")
    void redefinirSenha_deveRetornar400_quandoSenhaFraca() throws Exception {
        Map<String, String> request = Map.of(
                "token", "ABC123",
                "novaSenha", "senha123"
        );

        doThrow(new RuntimeException("A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais."))
                .when(usuarioService).redefinirSenhaComToken(anyString(), anyString());

        mockMvc.perform(post("/auth/redefinir-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais."));
    }

    @Test
    @DisplayName("POST /auth/redefinir-senha - deve retornar 400 quando o token expira")
    void redefinirSenha_deveRetornar400_quandoTokenExpirado() throws Exception {
        String tokenExpirado = "EXP-" + UUID.randomUUID().toString().substring(0, 4);
        Map<String, String> request = Map.of(
                "token", tokenExpirado,
                "novaSenha", "Senha@123"
        );

        doThrow(new RuntimeException("O código de recuperação de senha expirou."))
                .when(usuarioService).redefinirSenhaComToken(eq(tokenExpirado), anyString());

        mockMvc.perform(post("/auth/redefinir-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("O código de recuperação de senha expirou."));
    }
}
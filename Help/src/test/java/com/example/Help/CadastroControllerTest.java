package com.example.Help;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
class CadastroControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Deve validar que a senha de cadastro não pode ser curta (400 Bad Request)")
    void validarSenhaCurta() throws Exception {
        String emailUnico = "teste_" + System.currentTimeMillis() + "@gmail.com";

        mockMvc.perform(post("/api/usuarios/cadastrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Anny\", \"email\": \"" + emailUnico + "\", \"senha\": \"123\", \"cpf\": \"52998224725\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("CT04 - DEF-03: Deve rejeitar e-mail inválido sem arroba ou mal formatado (400 Bad Request)")
    void validarEmailInvalido() throws Exception {
        mockMvc.perform(post("/api/usuarios/cadastrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Mariana\", \"email\": \"mariana-sem-arroba\", \"senha\": \"SenhaForte@123\", \"cpf\": \"52998224725\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve rejeitar CPF com dígitos verificadores inválidos (400 Bad Request)")
    void validarCpfInvalido() throws Exception {
        String emailUnico = "teste_" + System.currentTimeMillis() + "@gmail.com";

        mockMvc.perform(post("/api/usuarios/cadastrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Mariana\", \"email\": \"" + emailUnico + "\", \"senha\": \"SenhaForte@123\", \"cpf\": \"111.111.111-11\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("CT03: Deve rejeitar envio vazio sem estourar rawPassword cannot be null (400 Bad Request)")
    void validarEnvioVazio() throws Exception {
        mockMvc.perform(post("/api/usuarios/cadastrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("CT01 - DEF-01: Cadastro válido deve persistir e NUNCA expor senha/hash na resposta (201 Created)")
    void validarCadastroSucessoNaoRetornaSenha() throws Exception {
        String emailUnico = "mariana_" + System.currentTimeMillis() + "@gmail.com";

        mockMvc.perform(post("/api/usuarios/cadastrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Mariana Silva\", \"email\": \"" + emailUnico + "\", \"senha\": \"SenhaSegura@123\", \"cpf\": \"52998224725\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.email").value(emailUnico))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.senha").doesNotExist());
    }

    @Test
    @DisplayName("CT02: E-mail duplicado deve retornar 409 Conflict com campo identificado")
    void validarEmailDuplicado() throws Exception {
        String emailUnico = "duplicado_" + System.currentTimeMillis() + "@gmail.com";

        // Primeiro cadastro
        mockMvc.perform(post("/api/usuarios/cadastrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Mariana Silva\", \"email\": \"" + emailUnico + "\", \"senha\": \"SenhaSegura@123\", \"cpf\": \"52998224725\"}"))
                .andExpect(status().isCreated());

        // Segundo cadastro com mesmo e-mail
        mockMvc.perform(post("/api/usuarios/cadastrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Mariana Silva 2\", \"email\": \"" + emailUnico + "\", \"senha\": \"SenhaSegura@123\", \"cpf\": \"82998224733\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.campo").value("email"));
    }

    @Test
    @DisplayName("Listar usuários não deve expor senhas/hashes na resposta")
    void validarListarUsuariosNaoExpoeSenha() throws Exception {
        mockMvc.perform(get("/api/usuarios/listar"))
                .andExpect(jsonPath("$[*].password").doesNotExist())
                .andExpect(jsonPath("$[*].senha").doesNotExist());
    }
}
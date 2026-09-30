package com.example.Help;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Adicionado em 25/09/2026: desde 16/09 o perfil padrao e "local" (H2 em ARQUIVO,
// ./data/helpdb). Sem esta anotacao, o teste roda no banco de desenvolvimento.
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MatriculaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Deve impedir matrícula com e-mail inválido")
    void validarEmailMatricula() throws Exception {
        mockMvc.perform(post("/api/matricula/gerar-token")//simulação de um email errado
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"email-invalido\", \"nomeCurso\": \"Java Spring\"}"))
                .andExpect(status().isBadRequest())
                // O 400 vem da busca do usuario, nao de validacao de formato: a DTO
                // nao tem @Email. Um e-mail bem formado e nao cadastrado tambem recebe 400.
                .andExpect(jsonPath("$.error").value("Usuário não encontrado."));
    }
}
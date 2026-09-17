package com.example.Help;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MatriculaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Deve impedir matrícula com e-mail inválido")
    void validarEmailMatricula() throws Exception {
        mockMvc.perform(post("/api/matricula/gerar-token")//simulação de um email errado
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"email-invalido\", \"nomeCurso\": \"Java Spring\"}"))
                .andExpect(status().isBadRequest());
    }
}
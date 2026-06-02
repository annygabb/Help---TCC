package com.example.Help;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CadastroControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Deve validar que a senha de cadastro não pode ser curta")
    void validarSenhaCurta() throws Exception {
        String emailUnico = "teste_" + System.currentTimeMillis() + "@gmail.com";//Gera um email único em tempo de execução para não conflitar com dados reais

        mockMvc.perform(post("/api/usuarios/cadastrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Anny\", \"email\": \"" + emailUnico + "\", \"senha\": \"123\"}"))
                .andExpect(status().isBadRequest());
    }
}
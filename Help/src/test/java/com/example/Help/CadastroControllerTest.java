<<<<<<< HEAD
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
class CadastroControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Deve validar que a senha de cadastro não pode ser curta")
    void validarSenhaCurta() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Anny\", \"email\": \"annygabbyoficial@gmail.com\", \"senha\": \"123\"}"))
                .andExpect(status().isBadRequest()); //espera retornar o erro 400, pois a senha é de até 12 digitos
    }
=======
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
class CadastroControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Deve validar que a senha de cadastro não pode ser curta")
    void validarSenhaCurta() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": \"Anny\", \"email\": \"annygabbyoficial@gmail.com\", \"senha\": \"123\"}"))
                .andExpect(status().isBadRequest()); //espera retornar o erro 400, pois a senha é de até 12 digitos
    }
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac
}
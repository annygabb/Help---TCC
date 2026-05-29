package com.example.Help;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CursoTest {

    @Test
    @DisplayName("Deve verificar se os detalhes do curso estão corretos")
    void validarDadosCurso() {
        String nomeCurso = "Java Spring Boot Profissional";
        int cargaHoraria = 40;

        assertEquals("Java Spring Boot Profissional", nomeCurso);
        assertTrue(cargaHoraria == 40);
    }

}
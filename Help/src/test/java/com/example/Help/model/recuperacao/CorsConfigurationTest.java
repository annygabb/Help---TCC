package com.example.Help.model.recuperacao;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CorsConfigurationTest {

    @Test
    void deveSepararEEliminarEspacosDasOrigensConfiguradas() {
        List<String> origens = SecurityConfig.parseAllowedOrigins(
                "http://localhost:5173, https://help.vercel.app ,https://preview.vercel.app"
        );

        assertEquals(List.of(
                "http://localhost:5173",
                "https://help.vercel.app",
                "https://preview.vercel.app"
        ), origens);
    }

    @Test
    void deveIgnorarOrigensVazias() {
        assertEquals(
                List.of("https://help.vercel.app"),
                SecurityConfig.parseAllowedOrigins(" ,https://help.vercel.app,, ")
        );
    }
}

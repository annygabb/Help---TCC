package com.example.Help.model.empresa;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** Bloqueia a passagem de prompts arbitrários ao provedor de IA. */
@RestController
@RequestMapping("/api/ia")
public class AnaliseIaController {
    @PostMapping("/match")
    public ResponseEntity<?> analisar() {
        // O frontend usa o cálculo local quando a análise externa está indisponível.
        // Reativação depende de dados autorizados e quotas no servidor.
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("mensagem", "Análise externa temporariamente indisponível."));
    }
}

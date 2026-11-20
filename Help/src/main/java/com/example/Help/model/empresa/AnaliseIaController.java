package com.example.Help.model.empresa;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/** Proxy autenticado: a chave do provedor permanece somente no servidor. */
@RestController
@RequestMapping("/api/ia")
public class AnaliseIaController {
    private final ObjectMapper json;
    private final String chave;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public AnaliseIaController(ObjectMapper json, @Value("${GEMINI_API_KEY:}") String chave) {
        this.json = json;
        this.chave = chave;
    }

    @PostMapping("/match")
    public ResponseEntity<?> analisar(@RequestBody Map<String, String> dados) {
        String prompt = dados.get("prompt");
        if (prompt == null || prompt.isBlank() || prompt.length() > 16000)
            return ResponseEntity.badRequest().body(Map.of("mensagem", "Dados da análise inválidos."));
        if (chave.isBlank())
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("mensagem", "Análise por IA indisponível."));
        try {
            String corpo = json.writeValueAsString(Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                    "generationConfig", Map.of("temperature", 0.2, "responseMimeType", "application/json")));
            HttpRequest pedido = HttpRequest.newBuilder(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"))
                    .timeout(Duration.ofSeconds(20))
                    .header("Content-Type", "application/json").header("x-goog-api-key", chave)
                    .POST(HttpRequest.BodyPublishers.ofString(corpo)).build();
            HttpResponse<String> resposta = client.send(pedido, HttpResponse.BodyHandlers.ofString());
            if (resposta.statusCode() < 200 || resposta.statusCode() >= 300)
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("mensagem", "Análise por IA indisponível."));
            return ResponseEntity.ok(json.readTree(resposta.body()));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("mensagem", "Análise por IA indisponível."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("mensagem", "Análise por IA indisponível."));
        }
    }
}

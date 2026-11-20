package com.example.Help.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/** Envio por HTTPS em produção; SMTP permanece disponível para desenvolvimento e testes. */
@Service
public class EmailService {
    private final JavaMailSender smtp;
    private final ObjectMapper json;
    private final String provider;
    private final String apiKey;
    private final String remetente;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public EmailService(JavaMailSender smtp, ObjectMapper json,
                        @Value("${app.email.provider:smtp}") String provider,
                        @Value("${RESEND_API_KEY:}") String apiKey,
                        @Value("${EMAIL_FROM:}") String remetente) {
        this.smtp = smtp;
        this.json = json;
        this.provider = provider;
        this.apiKey = apiKey;
        this.remetente = remetente;
    }

    public void enviarTexto(String para, String assunto, String texto) {
        if ("smtp".equalsIgnoreCase(provider)) {
            SimpleMailMessage mensagem = new SimpleMailMessage();
            if (!remetente.isBlank()) mensagem.setFrom(remetente);
            mensagem.setTo(para);
            mensagem.setSubject(assunto);
            mensagem.setText(texto);
            smtp.send(mensagem);
            return;
        }
        if (!"resend".equalsIgnoreCase(provider) || apiKey.isBlank() || remetente.isBlank())
            throw new IllegalStateException("Serviço de e-mail não configurado.");
        try {
            String corpo = json.writeValueAsString(Map.of("from", remetente, "to", List.of(para),
                    "subject", assunto, "text", texto));
            HttpRequest pedido = HttpRequest.newBuilder(URI.create("https://api.resend.com/emails"))
                    .timeout(Duration.ofSeconds(12))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(corpo)).build();
            HttpResponse<Void> resposta = http.send(pedido, HttpResponse.BodyHandlers.discarding());
            if (resposta.statusCode() < 200 || resposta.statusCode() >= 300)
                throw new IllegalStateException("Não foi possível enviar o e-mail.");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Não foi possível enviar o e-mail.", e);
        } catch (Exception e) {
            throw new IllegalStateException("Não foi possível enviar o e-mail.", e);
        }
    }

    public boolean configurado() {
        return "smtp".equalsIgnoreCase(provider)
                || ("resend".equalsIgnoreCase(provider) && !apiKey.isBlank() && !remetente.isBlank());
    }
}

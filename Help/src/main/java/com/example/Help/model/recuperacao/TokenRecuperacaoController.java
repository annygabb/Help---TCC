package com.example.Help.model.recuperacao;

import com.example.Help.Service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class TokenRecuperacaoController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/esqueci-senha")
    public ResponseEntity<?> solicitarRecuperacao(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            usuarioService.gerarTokenRecuperacao(email);
            return ResponseEntity.ok(Map.of(
                    "message", "Se o e-mail estiver cadastrado, você receberá um código."
            ));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Não foi possível processar a solicitação."));
        }
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<?> redefinirSenha(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String novaSenha = request.get("novaSenha");

            usuarioService.redefinirSenhaComToken(request.get("email"), token, novaSenha);

            return ResponseEntity.ok(Map.of("message", "Senha alterada com sucesso!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Não foi possível processar a solicitação."));
        }
    }
}

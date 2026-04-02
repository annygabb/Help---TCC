package com.example.Help.model.recuperacao;

import com.example.Help.Service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class TokenRecuperacaoController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/esqueci-senha") //endpoint pra solicitar a recuperação
    public ResponseEntity<?> solicitarRecuperacao(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String token = usuarioService.gerarTokenRecuperacao(email);

            return ResponseEntity.ok(Map.of(
                    "message", "Código de recuperação gerado com sucesso!",
                    "token", token
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/redefinir-senha")//endpoint pra validar o token e trocar a senha
    public ResponseEntity<?> redefinirSenha(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String novaSenha = request.get("novaSenha");

            usuarioService.redefinirSenhaComToken(token, novaSenha);

            return ResponseEntity.ok(Map.of("message", "Senha alterada com sucesso!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
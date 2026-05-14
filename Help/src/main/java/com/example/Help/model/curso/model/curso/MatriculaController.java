package com.example.Help.model.curso;

import com.example.Help.Service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/matricula")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowedHeaders = "*")
public class MatriculaController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/gerar-token")
    public ResponseEntity<?> solicitarTokenMatricula(@RequestBody MatriculaRequestDTO data) {
        try {
            usuarioService.gerarTokenMatricula(data.email(), data.nomeCurso());

            return ResponseEntity.ok(Map.of("message", "Token enviado com sucesso para " + data.email()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/confirmar")
    public ResponseEntity<?> confirmarMatricula(@RequestBody Map<String, String> payload) {
        try {
            String token = payload.get("token");

            usuarioService.confirmarMatriculaComToken(token);

            return ResponseEntity.ok(Map.of("message", "Matrícula confirmada com sucesso!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
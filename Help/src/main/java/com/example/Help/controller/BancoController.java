package com.example.Help.controller;

import com.example.Help.Service.UsuarioService;
import com.example.Help.model.usuario.UsuarioRequestDTO;
import com.example.Help.model.usuario.UsuarioResponseDTO;
import com.example.Help.model.login.LoginRequestDTO;
import com.example.Help.model.curso.Curso;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("banco")
@CrossOrigin(origins = "http://localhost:5173")

public class BancoController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/cadastro") //cadastro de novos usuários
    public ResponseEntity<String> saveUsuario(@RequestBody UsuarioRequestDTO data) {
        try {
            usuarioService.salvar(data);
            return ResponseEntity.status(HttpStatus.CREATED).body("Usuário cadastrado com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> getAll() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO data) {
        try {
            UsuarioResponseDTO usuario = usuarioService.autenticarUsuario(data);
            return ResponseEntity.ok(usuario); //retorna pro react salvar
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
    // NOVO: Endpoint para atualizar Bio, Cargo e Localização
    @PutMapping("/perfil")
    public ResponseEntity<String> updatePerfil(@RequestBody UsuarioRequestDTO data) {
        try {
            usuarioService.atualizarPerfil(data);
            return ResponseEntity.ok("Perfil atualizado com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/cursos/{usuarioId}")//busca os cursos do usuário que ta logado
    public ResponseEntity<List<Curso>> getCursosDoUsuario(@PathVariable UUID usuarioId) {
        try {
            List<Curso> cursos = usuarioService.listarCursosDoUsuario(usuarioId);
            return ResponseEntity.ok(cursos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

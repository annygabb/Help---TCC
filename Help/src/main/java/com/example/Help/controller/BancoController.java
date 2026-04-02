package com.example.Help.controller;

import com.example.Help.Service.UsuarioService;
import com.example.Help.model.usuario.UsuarioRequestDTO;
import com.example.Help.model.usuario.UsuarioResponseDTO;
import com.example.Help.model.login.LoginRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/banco")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
public class BancoController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO data) {
        try {
            UsuarioResponseDTO usuario = usuarioService.realizarLogin(data);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @GetMapping("/listar-todos")
    public ResponseEntity<List<UsuarioResponseDTO>> getAll() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }
}
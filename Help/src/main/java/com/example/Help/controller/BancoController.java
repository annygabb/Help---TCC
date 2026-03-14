package com.example.Help.controller;

import com.example.Help.Service.UsuarioService;
import com.example.Help.model.usuario.UsuarioRequestDTO;
import com.example.Help.model.usuario.UsuarioResponseDTO;
import com.example.Help.model.login.LoginRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("banco")
@CrossOrigin(origins = "http://localhost:5173")
public class BancoController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<String> saveUsuario(@RequestBody UsuarioRequestDTO data) {
        try {
            usuarioService.salvar(data);
            return ResponseEntity.ok("Usuário cadastrado com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public List<UsuarioResponseDTO> getAll() {
        return usuarioService.listarTodos();
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequestDTO data) {
        String resultado = usuarioService.autenticar(data);
        if (resultado.contains("sucesso")) {
            return ResponseEntity.ok(resultado);
        }
        return ResponseEntity.status(401).body(resultado);
    }
}
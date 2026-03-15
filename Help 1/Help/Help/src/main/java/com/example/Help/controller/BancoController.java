package com.example.Help.controller;

import com.example.Help.controller.usuario.Usuario;
import com.example.Help.controller.usuario.UsuarioRequestDTO;
import com.example.Help.controller.usuario.UsuarioResponseDTO;
import com.example.Help.controller.usuario.LoginRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("banco")
public class BancoController {

    @Autowired
    private UsuarioRepository repository;

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping
    public ResponseEntity saveUsuario(@RequestBody UsuarioRequestDTO data) {
        if (repository.findByEmail(data.email()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("E-mail já cadastrado.");
        }

        Usuario usuarioData = new Usuario(data);
        repository.save(usuarioData);
        return ResponseEntity.ok().build();
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> getAll() {
        List<UsuarioResponseDTO> usuarioList = repository.findAll()
                .stream()
                .map(UsuarioResponseDTO::new)
                .toList();
        return ResponseEntity.ok(usuarioList);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/login")
    public ResponseEntity login(@RequestBody LoginRequestDTO data) {
        Optional<Usuario> usuario = repository.findByEmail(data.email());

        if (usuario.isPresent() && usuario.get().getSenha().equals(data.senha())) {
            return ResponseEntity.ok(new UsuarioResponseDTO(usuario.get()));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("E-mail ou senha inválidos.");
    }
}
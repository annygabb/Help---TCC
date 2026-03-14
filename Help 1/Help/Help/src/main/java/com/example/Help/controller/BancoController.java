package com.example.Help.controller;
import com.example.Help.controller.usuario.Usuario;
import com.example.Help.controller.usuario.UsuarioRepository;
import com.example.Help.controller.usuario.UsuarioRequestDTO;
import com.example.Help.controller.usuario.UsuarioResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("banco")
public class BancoController {

    @Autowired
    private UsuarioRepository repository;

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping
    public void saveUsuario(@RequestBody UsuarioRequestDTO data) {
        Usuario usuarioData = new Usuario(data);
        repository.save(usuarioData);
        return;
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping
    public List<UsuarioResponseDTO> getAll() {
        List<UsuarioResponseDTO> usuarioList = repository.findAll().stream(). map(UsuarioResponseDTO::new).toList();;
        return usuarioList;
    }
}

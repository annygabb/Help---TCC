package com.example.Help.controller;

import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import com.example.Help.model.usuario.UsuarioRequestDTO;
import com.example.Help.model.usuario.UsuarioResponseDTO;
import com.example.Help.model.login.LoginRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
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
    public void saveUsuario(@RequestBody UsuarioRequestDTO data) {
        Usuario usuarioData = new Usuario(data);
        repository.save(usuarioData);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping
    public List<UsuarioResponseDTO> getAll() {
        return repository.findAll().stream().map(UsuarioResponseDTO::new).toList();
    }

    // --- NOVO MÉTODO DE LOGIN PARA TESTAR ---
    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping("/login")

    public String login(@RequestBody LoginRequestDTO data) {
        Optional<Usuario> usuarioParaLogin = repository.findByEmail(data.email()); //vai buscar o usuario pelo seu email

        if (usuarioParaLogin.isPresent()) {
            Usuario usuario = usuarioParaLogin.get();
            if (usuario.getPassword().equals(data.password())) { //vai comparar as senhas para ver se esta correto
                return "Login realizado com sucesso! Bem-vindo " + usuario.getName();
            } else {
                return "Senha incorreta!";
            }
        }
        return "Usuário não encontrado!";
    }
}
package com.example.Help.model.login;

import com.example.Help.model.cadastro.CadastroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("login")
public class LoginController {

    @Autowired//faz criar uma conexão com o banco automaticamente
    private CadastroRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping
    public String login(@RequestBody LoginRequestDTO data) {//recebe do requestdo o email e senha do usuario
        var usuario = repository.findByEmailIgnoreCase(data.email().trim().toLowerCase());

        if(usuario.isPresent() && passwordEncoder.matches(data.password(), usuario.get().getPassword())) {
            return "Login realizado com sucesso! Bem-vindo(a), " + usuario.get().getName();
        }
        return "Email ou senha incorretos.";
    }
}

package com.example.Help.model.login;

import com.example.Help.model.cadastro.CadastroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("login")
public class LoginController {

    @Autowired
    private CadastroRepository repository;

    @PostMapping
    public String login(@RequestBody LoginRequestDTO data) {
        var usuario = repository.findByEmail(data.email()); //vai buscar o usuario pelo seu email

        if(usuario.isPresent() && usuario.get().getPassword().equals(data.password())) {
            return "Login realizado com sucesso! Bem-vindo(a), " + usuario.get().getName();
        }
        return "Email ou senha incorretos.";
    }
}
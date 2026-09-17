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

    @Autowired//faz criar uma conexão com o banco automaticamente
    private CadastroRepository repository;

    @PostMapping
    public String login(@RequestBody LoginRequestDTO data) {//recebe do requestdo o email e senha do usuario
        var usuario = repository.findByEmail(data.email()); //vai buscar e ver se tem o usuario pelo seu email

        if(usuario.isPresent() && usuario.get().getPassword().equals(data.password())) { //se existir o email, verifica a senha
            return "Login realizado com sucesso! Bem-vindo(a), " + usuario.get().getName();
        }
        return "Email ou senha incorretos.";
    }
}
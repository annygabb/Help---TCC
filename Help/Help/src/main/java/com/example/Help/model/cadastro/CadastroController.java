package com.example.Help.model.cadastro;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("cadastro")
public class CadastroController {

    @Autowired
    private CadastroRepository repository;

    @PostMapping
    public void criarUsuario(@RequestBody Cadastro data) {
        repository.save(data);
    }

    @GetMapping
    public List<Cadastro> listarUsuarios() {
        return repository.findAll();
    }
}
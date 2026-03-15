package com.example.Help.model.perfil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("perfis")
public class PerfilController {

    @Autowired
    private PerfilRepository repository;

    @PostMapping
    public void savePerfil(@RequestBody Perfil data) {
        repository.save(data);
    } //recebe os dados de um novo perfil e salva no banco

    @GetMapping
    public List<Perfil> getAll() { //retorna uma lista de todos os perfis criados
        return repository.findAll();
    }
}
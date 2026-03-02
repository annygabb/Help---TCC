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
    }

    @GetMapping
    public List<Perfil> getAll() {
        return repository.findAll();
    }
}
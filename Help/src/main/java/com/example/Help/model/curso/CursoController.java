package com.example.Help.model.curso;

import com.example.Help.model.curso.Curso;
import com.example.Help.model.curso.CursoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("cursos")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
public class CursoController {

    @Autowired //faz as buscas no banco de dados
    private CursoRepository repository;

    @CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")//faz conectar com o front
    @PostMapping //responde por post
    public void saveCurso(@RequestBody Curso data) { //transforma o json do front em uma classe curso
        repository.save(data); //usa a classe anterior com insert no banco
    }

    @CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")//faz conectar com o front
    @GetMapping //responde por post
    public List<Curso> getAll() {
        return repository.findAll();
    } //vai transformas os dados em listas pro react ler
}
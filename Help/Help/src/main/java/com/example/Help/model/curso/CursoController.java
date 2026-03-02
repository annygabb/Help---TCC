package com.example.Help.model.curso;

import com.example.Help.model.curso.Curso;
import com.example.Help.model.curso.CursoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("cursos")
public class CursoController {

    @Autowired
    private CursoRepository repository;

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @PostMapping
    public void saveCurso(@RequestBody Curso data) {
        repository.save(data);
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping
    public List<Curso> getAll() {
        return repository.findAll();
    }
}
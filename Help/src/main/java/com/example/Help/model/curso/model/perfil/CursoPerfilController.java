package com.example.Help.model.perfil;

import com.example.Help.model.perfil.CursoPerfil;
import com.example.Help.model.perfil.CursoPerfilRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cursos")
@CrossOrigin(origins = "*") //permite que o React acesse a API
public class CursoPerfilController {

    @Autowired
    private CursoPerfilRepository repository;

    @GetMapping
    public List<CursoPerfil> listarTodos() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<CursoPerfil> salvar(@RequestBody CursoPerfil curso) {
        CursoPerfil novoCurso = repository.save(curso);
        return ResponseEntity.ok(novoCurso);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CursoPerfil> atualizar(@PathVariable UUID id, @RequestBody CursoPerfil cursoAtualizado) {
        return repository.findById(id)
                .map(curso -> {
                    curso.setNomeCurso(cursoAtualizado.getNomeCurso());
                    curso.setInstituicao(cursoAtualizado.getInstituicao());
                    curso.setCargaHoraria(cursoAtualizado.getCargaHoraria());
                    curso.setTempoDuracao(cursoAtualizado.getTempoDuracao());
                    curso.setCertificadoUrl(cursoAtualizado.getCertificadoUrl());
                    return ResponseEntity.ok(repository.save(curso));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
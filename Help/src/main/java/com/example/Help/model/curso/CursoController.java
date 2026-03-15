package com.example.Help.model.curso;

import com.example.Help.model.curso.Curso;
import com.example.Help.model.curso.CursoRepository;
import com.example.Help.model.curso.CursoRequestDTO;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/cursos")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})

public class CursoController {

    @Autowired //faz as buscas no banco de dados
    private CursoRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/{usuarioId}")
    public ResponseEntity<Curso> saveCurso(@PathVariable UUID usuarioId, @RequestBody CursoRequestDTO data) {
        Usuario aluno = usuarioRepository.findById(usuarioId)//busca o usuário que é dono do curso
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        Curso novoCurso = new Curso(data, aluno);

        repository.save(novoCurso);
        return ResponseEntity.ok(novoCurso);
    }

    @GetMapping("/{usuarioId}") //Filtra os cursos apenas do usuário logado
    public List<Curso> getAllByUsuario(@PathVariable UUID usuarioId) {
        return repository.findByAlunoId(usuarioId); //Resolve o erro de busca
    }
}
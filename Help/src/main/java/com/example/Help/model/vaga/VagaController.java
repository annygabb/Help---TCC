package com.example.Help.model.vaga;

import com.example.Help.model.vaga.Vaga;
import com.example.Help.model.vaga.VagaRepository;
import com.example.Help.model.vaga.VagaRequestDTO;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController //recebe e leva as informações
@RequestMapping("/vagas") //define a rota pra conexão
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})

public class VagaController {

    @Autowired
    private VagaRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;
    @GetMapping
    public List<Vaga> getAll() {
        return repository.findAll();
    }

    @PostMapping("/{usuarioId}")
    public ResponseEntity<Vaga> saveVaga(@PathVariable UUID usuarioId, @RequestBody VagaRequestDTO data) {
        Usuario anunciante = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Vaga novaVaga = new Vaga(data, anunciante);
        repository.save(novaVaga);
        return ResponseEntity.ok(novaVaga);
    }
    @GetMapping("/anunciante/{usuarioId}")//busca vagas
    public ResponseEntity<List<Vaga>> getVagasPorAnunciante(@PathVariable UUID usuarioId) {
        return ResponseEntity.ok(repository.findByAnuncianteId(usuarioId));
    }

    @DeleteMapping("/{id}")//exclui uma vaga
    public ResponseEntity<Void> deleteVaga(@PathVariable UUID id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
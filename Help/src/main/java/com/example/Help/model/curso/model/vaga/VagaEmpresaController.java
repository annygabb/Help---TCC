package com.example.Help.model.vaga;

import com.example.Help.Service.VagaEmpresaService;
import com.example.Help.model.vaga.VagaEmpresa;
import com.example.Help.model.usuario.Usuario;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vagas")
@CrossOrigin(origins = "*")
public class VagaEmpresaController {

    @Autowired
    private VagaEmpresaService service;

    @GetMapping //lista todas as vagas cadastradas pelas empresas
    public ResponseEntity<List<VagaEmpresa>> listar() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @PostMapping //cria uma nova vaga
    public ResponseEntity<VagaEmpresa> criar(@RequestBody @Valid VagaEmpresaRequestDTO dados) {
        VagaEmpresa vagaSalva = service.salvarVaga(dados);
        return ResponseEntity.status(201).body(vagaSalva);
    }

    @DeleteMapping("/{id}") //remove vaga
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        service.deletarVaga(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/talentos") //retorna a lista de candidatos
    public ResponseEntity<List<Object>> listarBancoDeTalentos() { //service buscar os dados da tabela de usuarios
        return ResponseEntity.ok(service.listarCandidatosDisponiveis());
    }

    @GetMapping("/talentos/{id}") //detalhes de um talento
    public ResponseEntity<Object> buscarTalentoPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(service.buscarCandidatoPorId(id));
    }
}
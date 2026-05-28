package com.example.Help.model.empresa;

import com.example.Help.Service.VagaEmpresaService;
import jakarta.persistence.*;
import jakarta.validation.Valid;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record TokenDadosEmpresaDTO (String token) {
    @Entity
    @Data
    public static class VagaEmpresa {
        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        @Column(name = "id", updatable = false, nullable = false)
        private UUID id;
        private String cargo;
        private LocalDate dataPublicacao;
        private Integer experienciaMinima;

        @ElementCollection
        private List<String> skillsExigidas;

        @ElementCollection
        private List<UUID> inscritosIds; //IDs dos talentos inscritos
    }

    @RestController
    @RequestMapping("/api/vagas")
    @CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
    public static class VagaEmpresaController {

        @Autowired
        private VagaEmpresaService service;

        @GetMapping //lista todas as vagas cadastradas pelas empresas
        public ResponseEntity<List<VagaEmpresa>> listar() {
            return ResponseEntity.ok(service.listarTodas());
        }

        @PostMapping //cria uma nova vaga
        public ResponseEntity<VagaEmpresa> criar(@RequestBody @Valid EmpresaRepository.VagaEmpresaRequestDTO dados) {
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
}

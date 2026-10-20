package com.example.Help.model.empresa;

import com.example.Help.Service.VagaEmpresaService;
import com.example.Help.Service.EmpresaAutenticadaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vagas")
public class VagaEmpresaController {

    private final VagaEmpresaService service;
    private final EmpresaAutenticadaService empresaAutenticadaService;

    public VagaEmpresaController(
            VagaEmpresaService service,
            EmpresaAutenticadaService empresaAutenticadaService
    ) {
        this.service = service;
        this.empresaAutenticadaService = empresaAutenticadaService;
    }

    @GetMapping //lista todas as vagas cadastradas pelas empresas
    public ResponseEntity<List<VagaEmpresa>> listar() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @PostMapping //cria uma nova vaga
    public ResponseEntity<VagaEmpresa> criar(
            @RequestBody @Valid VagaEmpresaRequestDTO dados,
            Authentication authentication
    ) {
        VagaEmpresa vagaSalva = service.salvarVaga(empresaAutenticadaService.obter(authentication), dados);
        return ResponseEntity.status(HttpStatus.CREATED).body(vagaSalva);
    }

    @GetMapping("/minhas")
    public ResponseEntity<List<VagaEmpresa>> listarMinhas(Authentication authentication) {
        var empresa = empresaAutenticadaService.obter(authentication);
        return ResponseEntity.ok(service.listarDaEmpresa(empresa.getId()));
    }

    @DeleteMapping("/{id}") //remove vaga
    public ResponseEntity<Void> deletar(@PathVariable UUID id, Authentication authentication) {
        var empresa = empresaAutenticadaService.obter(authentication);
        service.deletarVaga(id, empresa.getId());
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

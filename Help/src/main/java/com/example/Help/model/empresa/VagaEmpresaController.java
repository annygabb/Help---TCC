package com.example.Help.model.empresa;

import com.example.Help.Service.VagaEmpresaService;
import com.example.Help.Service.EmpresaAutenticadaService;
import com.example.Help.Service.UsuarioAutenticadoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/vagas")
public class VagaEmpresaController {

    private final VagaEmpresaService service;
    private final EmpresaAutenticadaService empresaAutenticadaService;
    private final UsuarioAutenticadoService usuarioAutenticadoService;

    public VagaEmpresaController(
            VagaEmpresaService service,
            EmpresaAutenticadaService empresaAutenticadaService,
            UsuarioAutenticadoService usuarioAutenticadoService
    ) {
        this.service = service;
        this.empresaAutenticadaService = empresaAutenticadaService;
        this.usuarioAutenticadoService = usuarioAutenticadoService;
    }

    @GetMapping //lista todas as vagas cadastradas pelas empresas
    public ResponseEntity<List<VagaEmpresa>> listar() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @PostMapping //cria uma nova vaga
    public ResponseEntity<VagaEmpresaPrivadaDTO> criar(
            @RequestBody @Valid VagaEmpresaRequestDTO dados,
            Authentication authentication
    ) {
        VagaEmpresa vagaSalva = service.salvarVaga(empresaAutenticadaService.obter(authentication), dados);
        return ResponseEntity.status(HttpStatus.CREATED).body(VagaEmpresaPrivadaDTO.de(vagaSalva));
    }

    @GetMapping("/minhas")
    public ResponseEntity<List<VagaEmpresaPrivadaDTO>> listarMinhas(Authentication authentication) {
        var empresa = empresaAutenticadaService.obter(authentication);
        return ResponseEntity.ok(service.listarDaEmpresa(empresa.getId()).stream().map(VagaEmpresaPrivadaDTO::de).toList());
    }

    @DeleteMapping("/{id}") //remove vaga
    public ResponseEntity<Void> deletar(@PathVariable UUID id, Authentication authentication) {
        var empresa = empresaAutenticadaService.obter(authentication);
        service.deletarVaga(id, empresa.getId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<VagaEmpresaPrivadaDTO> atualizar(@PathVariable UUID id,
            @RequestBody @Valid VagaEmpresaRequestDTO dados, Authentication authentication) {
        var empresa = empresaAutenticadaService.obter(authentication);
        return ResponseEntity.ok(VagaEmpresaPrivadaDTO.de(service.atualizarVaga(id, empresa.getId(), dados)));
    }

    @PostMapping("/{id}/candidaturas")
    public ResponseEntity<Map<String, String>> candidatar(@PathVariable UUID id, Authentication authentication) {
        boolean criada = service.candidatar(id, usuarioAutenticadoService.obterId(authentication));
        return ResponseEntity.status(criada ? HttpStatus.CREATED : HttpStatus.OK)
                .body(Map.of("mensagem", criada ? "Candidatura registrada com sucesso." : "Você já se candidatou a esta vaga."));
    }

    @GetMapping("/talentos") //retorna a lista de candidatos
    public ResponseEntity<List<TalentoResumoDTO>> listarBancoDeTalentos() {
        return ResponseEntity.ok(service.listarCandidatosDisponiveis());
    }

    @GetMapping("/talentos/{id}") //detalhes de um talento
    public ResponseEntity<TalentoResumoDTO> buscarTalentoPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(service.buscarCandidatoPorId(id));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> erro(ResponseStatusException erro) {
        return ResponseEntity.status(erro.getStatusCode()).body(Map.of("mensagem",
                erro.getReason() == null ? "Não foi possível concluir a operação." : erro.getReason()));
    }
}

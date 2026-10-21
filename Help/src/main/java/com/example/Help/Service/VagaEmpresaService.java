package com.example.Help.Service;

import com.example.Help.model.empresa.VagaEmpresa;
import com.example.Help.model.empresa.VagaEmpresaRequestDTO;
import com.example.Help.model.empresa.VagaEmpresaRepository;
import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.usuario.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VagaEmpresaService {

    private final VagaEmpresaRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final SeguidorService seguidorService;
    private final NotificacaoService notificacaoService;

    public VagaEmpresaService(VagaEmpresaRepository repository, UsuarioRepository usuarioRepository,
                              SeguidorService seguidorService, NotificacaoService notificacaoService) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.seguidorService = seguidorService;
        this.notificacaoService = notificacaoService;
    }

    public List<VagaEmpresa> listarTodas() { // gerenciamento de vagas
        return repository.findAll();
    }

    public List<VagaEmpresa> listarDaEmpresa(UUID empresaId) {
        return repository.findByEmpresaIdOrderByDataPublicacaoDesc(empresaId);
    }

    public VagaEmpresa salvarVaga(Empresa empresa, VagaEmpresaRequestDTO dados) {
        VagaEmpresa novaVaga = new VagaEmpresa();

        novaVaga.setCargo(dados.cargo());
        novaVaga.setSkillsExigidas(dados.skillsExigidas());
        novaVaga.setExperienciaMinima(dados.experienciaMinima());
        novaVaga.setSalarioBase(dados.salarioBase());
        novaVaga.setDataPublicacao(LocalDate.now()); //Define a data de publicação automaticamente
        novaVaga.setEmpresa(empresa);

        VagaEmpresa salva = repository.save(novaVaga);
        seguidorService.listarParticipantesSeguidores(empresa).forEach(destinatario ->
                notificacaoService.criarOuAtualizar(destinatario,
                        com.example.Help.model.notificacao.TipoNotificacao.NOVA_VAGA_EMPRESA,
                        "Nova vaga de " + empresa.getCorporateName(),
                        "Vaga publicada: " + salva.getCargo(), empresa));
        return salva;
    }

    public void deletarVaga(UUID id, UUID empresaId) {
        VagaEmpresa vaga = repository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vaga não encontrada."));
        repository.delete(vaga);
    }

    public List<Object> listarCandidatosDisponiveis() { // busca todos os candidatos
        return usuarioRepository.findAll().stream()
                .map(usuario -> (Object) usuario)
                .collect(Collectors.toList());
    }

    public Object buscarCandidatoPorId(UUID id) { // busca um candidato específico pelo id
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidato não encontrado com o ID: " + id));
    }
}

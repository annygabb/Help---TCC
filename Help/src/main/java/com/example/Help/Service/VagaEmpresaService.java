package com.example.Help.Service;

import com.example.Help.model.empresa.VagaEmpresa;
import com.example.Help.model.empresa.VagaEmpresaRequestDTO;
import com.example.Help.model.empresa.VagaEmpresaRepository;
import com.example.Help.model.usuario.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VagaEmpresaService {

    @Autowired
    private VagaEmpresaRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository; //necessária para o Banco de Talentos

    public List<VagaEmpresa> listarTodas() { // gerenciamento de vagas
        return repository.findAll();
    }

    public VagaEmpresa salvarVaga(VagaEmpresaRequestDTO dados) {
        VagaEmpresa novaVaga = new VagaEmpresa();

        novaVaga.setCargo(dados.cargo());
        novaVaga.setSkillsExigidas(dados.skillsExigidas());
        novaVaga.setExperienciaMinima(dados.experienciaMinima());
        novaVaga.setDataPublicacao(LocalDate.now()); //Define a data de publicação automaticamente

        return repository.save(novaVaga);
    }

    public void deletarVaga(UUID id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Vaga não encontrada com o ID: " + id);
        }
        repository.deleteById(id);
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
package com.example.Help.Service;

import com.example.Help.model.perfil.CursoPerfil;
import com.example.Help.model.perfil.Experiencia;
import com.example.Help.model.perfil.Perfil;
import com.example.Help.model.perfil.PerfilRepository;
import com.example.Help.model.perfil.PerfilRequestDTO;
import com.example.Help.model.perfil.PerfilResponseDTO;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.UUID;

@Service
public class PerfilService {

    private final PerfilRepository perfilRepository;
    private final UsuarioRepository usuarioRepository;

    public PerfilService(PerfilRepository perfilRepository, UsuarioRepository usuarioRepository) {
        this.perfilRepository = perfilRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public PerfilResponseDTO obter(UUID usuarioId) {
        Usuario usuario = buscarUsuario(usuarioId);
        Perfil perfil = perfilRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> criarPerfil(usuario));

        return toResponse(perfil);
    }

    /** Dados profissionais visíveis, sem e-mail, CPF, certificados ou currículo privado. */
    @Transactional
    public PerfilPublico obterPublico(UUID usuarioId) {
        Usuario usuario = buscarUsuario(usuarioId);
        if (!usuario.isAtivo()) throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, "Perfil não encontrado.");
        Perfil perfil = perfilRepository.findByUsuarioId(usuarioId).orElseGet(() -> novoPerfil(usuario));
        var experiencias = perfil.getExperiencias().stream().map(e -> new ExperienciaPublica(
                e.getEmpresa(), e.getCargo(), e.getAtividades(), e.getDataInicio(), e.getDataFim(), e.isTrabalhaAtualmente())).toList();
        var cursos = perfil.getCursos().stream().map(c -> new CursoPublico(c.getNomeCurso(), c.getInstituicao(), c.getCargaHoraria())).toList();
        return new PerfilPublico(perfil.getBio(), perfil.getSkills(), experiencias, cursos);
    }

    public record PerfilPublico(String bio, String skills, java.util.List<ExperienciaPublica> experiencias,
                                java.util.List<CursoPublico> cursos) {}
    public record ExperienciaPublica(String empresa, String cargo, String atividades, String dataInicio,
                                    String dataFim, boolean trabalhaAtualmente) {}
    public record CursoPublico(String nomeCurso, String instituicao, String cargaHoraria) {}

    @Transactional
    public ResumoPerfil obterResumo(UUID usuarioId) {
        Usuario usuario = buscarUsuario(usuarioId);
        Perfil perfil = perfilRepository.findByUsuarioId(usuarioId).orElseGet(() -> novoPerfil(usuario));
        var experiencias = perfil.getExperiencias().stream()
                .map(e -> new ExperienciaResumida(e.getEmpresa(), e.isTrabalhaAtualmente())).toList();
        return new ResumoPerfil(usuario.getId(), perfil.getName(), perfil.getCargoAtual(), usuario.getLocation(),
                com.example.Help.util.Miniaturas.avatar(usuario.getFotoUrl()), experiencias);
    }

    public record ResumoPerfil(UUID usuarioId, String nome, String cargo, String localidade, String fotoUrl,
                               java.util.List<ExperienciaResumida> experiencias) {}
    public record ExperienciaResumida(String empresa, boolean trabalhaAtualmente) {}

    @Transactional
    public PerfilResponseDTO atualizar(UUID usuarioId, PerfilRequestDTO dados) {
        Usuario usuario = buscarUsuario(usuarioId);
        Perfil perfil = perfilRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> novoPerfil(usuario));

        perfil.setName(textoOuAtual(dados.nome(), perfil.getName(), usuario.getName()));
        perfil.setCargoAtual(textoOuAtual(dados.cargo(), perfil.getCargoAtual(), usuario.getJobRole()));
        perfil.setBio(textoOuAtual(dados.bio(), perfil.getBio(), usuario.getBio()));
        String foto = textoOuAtual(dados.fotoUrl(), usuario.getFotoUrl(), perfil.getFotoUrl());
        perfil.setFotoUrl(foto);

        usuario.setName(perfil.getName());
        usuario.setJobRole(perfil.getCargoAtual());
        usuario.setLocation(textoOuAtual(dados.localidade(), usuario.getLocation(), null));
        usuario.setBio(perfil.getBio());
        usuario.setFotoUrl(foto);

        perfil.getExperiencias().clear();
        dados.experiencias().stream()
                .map(this::novaExperiencia)
                .forEach(perfil.getExperiencias()::add);

        perfil.getCursos().clear();
        dados.cursos().stream()
                .map(this::novoCurso)
                .forEach(perfil.getCursos()::add);

        usuarioRepository.save(usuario);
        Perfil salvo = perfilRepository.save(perfil);
        return toResponse(salvo);
    }

    private Usuario buscarUsuario(UUID usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
    }

    private Perfil criarPerfil(Usuario usuario) {
        return perfilRepository.save(novoPerfil(usuario));
    }

    private Perfil novoPerfil(Usuario usuario) {
        Perfil perfil = new Perfil();
        perfil.setUsuario(usuario);
        perfil.setName(usuario.getName());
        perfil.setCargoAtual(usuario.getJobRole());
        perfil.setBio(usuario.getBio());
        perfil.setSkills(usuario.getSkills());
        perfil.setFotoUrl(usuario.getFotoUrl());
        perfil.setExperiencias(new ArrayList<>());
        perfil.setCursos(new ArrayList<>());
        return perfil;
    }

    private Experiencia novaExperiencia(PerfilRequestDTO.ExperienciaDTO dados) {
        Experiencia experiencia = new Experiencia();
        experiencia.setEmpresa(dados.empresa());
        experiencia.setCargo(dados.cargo());
        experiencia.setTipoEmprego(dados.tipoEmprego());
        experiencia.setModeloTrabalho(dados.modeloTrabalho());
        experiencia.setAtividades(dados.atividades());
        experiencia.setTrabalhaAtualmente(dados.trabalhaAtualmente());
        experiencia.setDataInicio(dados.dataInicio());
        experiencia.setDataFim(dados.trabalhaAtualmente() ? null : dados.dataFim());
        return experiencia;
    }

    private CursoPerfil novoCurso(PerfilRequestDTO.CursoDTO dados) {
        CursoPerfil curso = new CursoPerfil();
        curso.setNomeCurso(dados.nomeCurso());
        curso.setInstituicao(dados.instituicao());
        curso.setCargaHoraria(dados.cargaHoraria());
        curso.setTempoDuracao(dados.tempoDuracao());
        curso.setCertificadoUrl(dados.certificadoUrl());
        return curso;
    }

    private PerfilResponseDTO toResponse(Perfil perfil) {
        Usuario usuario = perfil.getUsuario();

        return new PerfilResponseDTO(
                perfil.getId(),
                usuario.getId(),
                perfil.getName(),
                usuario.getEmail(),
                perfil.getCargoAtual(),
                usuario.getLocation(),
                perfil.getBio(),
                usuario.getFotoUrl() != null ? usuario.getFotoUrl() : perfil.getFotoUrl(),
                perfil.getCurriculoUrl(),
                perfil.getSkills(),
                perfil.getExperiencias().stream()
                        .map(exp -> new PerfilResponseDTO.ExperienciaDTO(
                                exp.getId(),
                                exp.getEmpresa(),
                                exp.getCargo(),
                                exp.getTipoEmprego(),
                                exp.getModeloTrabalho(),
                                exp.getAtividades(),
                                exp.isTrabalhaAtualmente(),
                                exp.getDataInicio(),
                                exp.getDataFim()
                        ))
                        .toList(),
                perfil.getCursos().stream()
                        .map(curso -> new PerfilResponseDTO.CursoDTO(
                                curso.getId(),
                                curso.getNomeCurso(),
                                curso.getInstituicao(),
                                curso.getCargaHoraria(),
                                curso.getTempoDuracao(),
                                curso.getCertificadoUrl()
                        ))
                        .toList()
        );
    }

    private String textoOuAtual(String novoValor, String valorAtual, String valorPadrao) {
        if (novoValor != null) {
            return novoValor.trim();
        }
        return valorAtual != null ? valorAtual : valorPadrao;
    }
}

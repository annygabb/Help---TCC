package com.example.Help.Service;

import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.publicacao.*;
import com.example.Help.model.social.ParticipanteSocial;
import com.example.Help.model.usuario.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PublicacaoService {
    private final PublicacaoRepository repository;
    private final SeguidorService seguidores;

    public PublicacaoService(PublicacaoRepository repository, SeguidorService seguidores) {
        this.repository = repository;
        this.seguidores = seguidores;
    }

    @Transactional
    public PublicacaoResponseDTO criar(ParticipanteSocial autor, PublicacaoRequestDTO dados) {
        String conteudo = dados.conteudo() == null ? "" : dados.conteudo().trim();
        String midia = dados.midiaUrl();
        if (conteudo.isBlank() && (midia == null || midia.isBlank())) {
            throw new IllegalArgumentException("Escreva algo ou adicione uma mídia.");
        }
        if (midia != null && !midia.isBlank() && !midia.startsWith("data:image/") && !midia.startsWith("data:video/")) {
            throw new IllegalArgumentException("Formato de mídia inválido.");
        }
        PermissaoComentario permissao = dados.permissaoComentario() == null
                ? PermissaoComentario.TODOS : dados.permissaoComentario();
        Publicacao salva = repository.save(new Publicacao(autor, conteudo, midia, dados.midiaTipo(), permissao));
        return toResponse(salva, autor);
    }

    @Transactional(readOnly = true)
    public List<PublicacaoResponseDTO> listar(ParticipanteSocial atual) {
        return repository.findAllByOrderByCriadaEmDesc().stream()
                .filter(p -> p.getAutorSocial() != null && p.getAutorSocial().isAtivo())
                .map(p -> toResponse(p, atual))
                .toList();
    }

    private PublicacaoResponseDTO toResponse(Publicacao p, ParticipanteSocial atual) {
        ParticipanteSocial autor = p.getAutorSocial();
        boolean proprio = autor.getId().equals(atual.getId()) && autor.getTipoParticipante() == atual.getTipoParticipante();
        boolean podeComentar = switch (p.getPermissaoComentario()) {
            case TODOS -> true;
            case DESATIVADO -> false;
            case SEGUIDORES -> proprio || seguidores.estaSeguindo(atual, autor.getId(), autor.getTipoParticipante());
        };
        String subtitulo = autor instanceof Usuario u ? u.getCargo()
                : autor instanceof Empresa ? "Empresa" : null;
        return new PublicacaoResponseDTO(p.getId(), autor.getId(), autor.getTipoParticipante(),
                autor.getNomeSocial(), subtitulo, autor.getFotoUrl(), p.getConteudo(), p.getMidiaUrl(),
                p.getMidiaTipo(), p.getPermissaoComentario(), podeComentar, DataHora.comoUtc(p.getCriadaEm()));
    }
}

package com.example.Help;

import com.example.Help.Service.PublicacaoService;
import com.example.Help.Service.SeguidorService;
import com.example.Help.model.publicacao.*;
import com.example.Help.model.usuario.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PublicacaoServiceTest {
    private PublicacaoRepository repository;
    private SeguidorService seguidores;
    private PublicacaoService service;

    @BeforeEach
    void configurar() {
        repository = mock(PublicacaoRepository.class);
        seguidores = mock(SeguidorService.class);
        service = new PublicacaoService(repository, seguidores);
        when(repository.save(any(Publicacao.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void publicacaoEhGlobalMesmoQuandoLeitorNaoSegueAutor() {
        Usuario autor = usuario("Autor");
        Usuario leitor = usuario("Leitor");
        Publicacao post = new Publicacao(autor, "Conteúdo global", null, null, PermissaoComentario.TODOS);
        when(repository.findAllByOrderByCriadaEmDesc()).thenReturn(List.of(post));

        var resposta = service.listar(leitor);

        assertThat(resposta).hasSize(1);
        assertThat(resposta.getFirst().conteudo()).isEqualTo("Conteúdo global");
        assertThat(resposta.getFirst().podeComentar()).isTrue();
        verifyNoInteractions(seguidores);
    }

    @Test
    void comentarioRestritoExigeSeguirAutor() {
        Usuario autor = usuario("Autor");
        Usuario leitor = usuario("Leitor");
        Publicacao post = new Publicacao(autor, "Seguidores", null, null, PermissaoComentario.SEGUIDORES);
        when(repository.findAllByOrderByCriadaEmDesc()).thenReturn(List.of(post));
        when(seguidores.estaSeguindo(leitor, autor.getId(), autor.getTipoParticipante())).thenReturn(false);

        assertThat(service.listar(leitor).getFirst().podeComentar()).isFalse();
    }

    @Test
    void publicacaoRestritaNaoApareceParaQuemNaoSegueAutor() {
        Usuario autor = usuario("Autor");
        Usuario leitor = usuario("Leitor");
        Publicacao post = new Publicacao(autor, "Somente seguidores", null, null,
                PermissaoComentario.TODOS, VisibilidadePublicacao.SEGUIDORES);
        when(repository.findAllByOrderByCriadaEmDesc()).thenReturn(List.of(post));
        when(seguidores.estaSeguindo(leitor, autor.getId(), autor.getTipoParticipante())).thenReturn(false);

        assertThat(service.listar(leitor)).isEmpty();
    }

    @Test
    void publicacaoRestritaApareceParaSeguidorEParaProprioAutor() {
        Usuario autor = usuario("Autor");
        Usuario seguidor = usuario("Seguidor");
        Publicacao post = new Publicacao(autor, "Somente seguidores", null, null,
                PermissaoComentario.TODOS, VisibilidadePublicacao.SEGUIDORES);
        when(repository.findAllByOrderByCriadaEmDesc()).thenReturn(List.of(post));
        when(seguidores.estaSeguindo(seguidor, autor.getId(), autor.getTipoParticipante())).thenReturn(true);

        assertThat(service.listar(seguidor)).hasSize(1);
        assertThat(service.listar(autor)).hasSize(1);
    }

    private Usuario usuario(String nome) {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setName(nome);
        usuario.setEmail(nome.toLowerCase() + "@help.test");
        usuario.setSenha("Senha123");
        usuario.setAtivo(true);
        return usuario;
    }
}

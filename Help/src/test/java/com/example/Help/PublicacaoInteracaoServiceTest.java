package com.example.Help;

import com.example.Help.Service.PublicacaoInteracaoService;
import com.example.Help.Service.SeguidorService;
import com.example.Help.model.publicacao.*;
import com.example.Help.model.usuario.Usuario;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class PublicacaoInteracaoServiceTest {
    @Test
    void alternarCurtidaPersisteEPermiteDescurtir() {
        PublicacaoRepository publicacoes = mock(PublicacaoRepository.class);
        CurtidaPublicacaoRepository curtidas = mock(CurtidaPublicacaoRepository.class);
        ComentarioPublicacaoRepository comentarios = mock(ComentarioPublicacaoRepository.class);
        PublicacaoInteracaoService service = new PublicacaoInteracaoService(publicacoes, curtidas, comentarios, mock(SeguidorService.class));
        Usuario autor = usuario("Autor");
        Usuario leitor = usuario("Leitor");
        Publicacao publicacao = new Publicacao(autor, "Post", null, null, PermissaoComentario.TODOS);
        publicacao.setId(UUID.randomUUID());
        when(publicacoes.findById(publicacao.getId())).thenReturn(Optional.of(publicacao));
        when(curtidas.findByPublicacaoIdAndParticipante(publicacao.getId(), leitor.getId(), leitor.getTipoParticipante()))
                .thenReturn(Optional.empty());
        when(curtidas.countByPublicacaoId(publicacao.getId())).thenReturn(1L);

        var resultado = service.alternarCurtida(publicacao.getId(), leitor);

        assertThat(resultado.curtida()).isTrue();
        assertThat(resultado.total()).isEqualTo(1);
        verify(curtidas).save(any(CurtidaPublicacao.class));
    }

    @Test
    void comentarPersisteAutorEConteudo() {
        PublicacaoRepository publicacoes = mock(PublicacaoRepository.class);
        CurtidaPublicacaoRepository curtidas = mock(CurtidaPublicacaoRepository.class);
        ComentarioPublicacaoRepository comentarios = mock(ComentarioPublicacaoRepository.class);
        PublicacaoInteracaoService service = new PublicacaoInteracaoService(publicacoes, curtidas, comentarios, mock(SeguidorService.class));
        Usuario autor = usuario("Autor");
        Usuario leitor = usuario("Leitor");
        Publicacao publicacao = new Publicacao(autor, "Post", null, null, PermissaoComentario.TODOS);
        publicacao.setId(UUID.randomUUID());
        when(publicacoes.findById(publicacao.getId())).thenReturn(Optional.of(publicacao));
        when(comentarios.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var resultado = service.comentar(publicacao.getId(), leitor, "  Muito bom  ");

        assertThat(resultado.autorNome()).isEqualTo("Leitor");
        assertThat(resultado.conteudo()).isEqualTo("Muito bom");
        verify(comentarios).save(any(ComentarioPublicacao.class));
    }

    private Usuario usuario(String nome) {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setName(nome);
        usuario.setAtivo(true);
        return usuario;
    }
}

package com.example.Help;

import com.example.Help.Service.NotificacaoService;
import com.example.Help.Service.ParticipanteService;
import com.example.Help.Service.SeguidorService;
import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.seguidor.Seguidor;
import com.example.Help.model.seguidor.SeguidorRepository;
import com.example.Help.model.social.TipoParticipante;
import com.example.Help.model.usuario.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class SeguidorServiceSocialTest {
    private SeguidorRepository repository;
    private ParticipanteService participantes;
    private NotificacaoService notificacoes;
    private SeguidorService service;

    @BeforeEach
    void configurar() {
        repository = mock(SeguidorRepository.class);
        participantes = mock(ParticipanteService.class);
        notificacoes = mock(NotificacaoService.class);
        service = new SeguidorService(repository, participantes, notificacoes);
    }

    @Test
    void usuarioSegueEmpresaENotificaEmpresa() {
        Usuario usuario = usuario();
        Empresa empresa = empresa();
        when(participantes.buscarAtivo(empresa.getId(), TipoParticipante.EMPRESA)).thenReturn(empresa);

        service.seguir(usuario, empresa.getId(), TipoParticipante.EMPRESA);

        ArgumentCaptor<Seguidor> captor = ArgumentCaptor.forClass(Seguidor.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getSeguidorSocial()).isSameAs(usuario);
        assertThat(captor.getValue().getSeguidoSocial()).isSameAs(empresa);
        verify(notificacoes).criar(eq(empresa), any(), anyString(), anyString(), eq(usuario));
    }

    @Test
    void impedeDuplicidadeSemCriarNovaNotificacao() {
        Usuario usuario = usuario();
        Empresa empresa = empresa();
        when(participantes.buscarAtivo(empresa.getId(), TipoParticipante.EMPRESA)).thenReturn(empresa);
        when(repository.existe(usuario.getId(), null, null, empresa.getId())).thenReturn(true);

        assertThatThrownBy(() -> service.seguir(usuario, empresa.getId(), TipoParticipante.EMPRESA))
                .hasMessageContaining("já está seguindo");
        verify(repository, never()).save(any());
        verifyNoInteractions(notificacoes);
    }

    private Usuario usuario() {
        Usuario u = new Usuario(); u.setId(UUID.randomUUID()); u.setName("Ana");
        u.setEmail("ana@help.test"); u.setSenha("Senha123"); u.setAtivo(true); return u;
    }

    private Empresa empresa() {
        Empresa e = new Empresa(); e.setId(UUID.randomUUID()); e.setCorporateName("Help Ltda");
        e.setEmail("empresa@help.test"); e.setCnpj("12345678000190");
        e.setPassword("Senha123"); e.setAtivo(true); return e;
    }
}

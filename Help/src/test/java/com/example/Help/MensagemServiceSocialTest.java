package com.example.Help;

import com.example.Help.Service.MensagemService;
import com.example.Help.Service.NotificacaoService;
import com.example.Help.Service.ParticipanteService;
import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.mensagem.Mensagem;
import com.example.Help.model.mensagem.MensagemRepository;
import com.example.Help.model.mensagem.MensagemRequestDTO;
import com.example.Help.model.social.TipoParticipante;
import com.example.Help.model.usuario.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class MensagemServiceSocialTest {
    private MensagemRepository repository;
    private ParticipanteService participantes;
    private NotificacaoService notificacoes;
    private MensagemService service;

    @BeforeEach
    void configurar() {
        repository = mock(MensagemRepository.class);
        participantes = mock(ParticipanteService.class);
        notificacoes = mock(NotificacaoService.class);
        service = new MensagemService(repository, participantes, notificacoes);
        when(repository.save(any(Mensagem.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void usuarioEnviaParaEmpresaSemTrocarIdentidades() {
        Usuario usuario = usuario();
        Empresa empresa = empresa();
        when(participantes.buscarAtivo(empresa.getId(), TipoParticipante.EMPRESA)).thenReturn(empresa);

        service.enviar(usuario, new MensagemRequestDTO(empresa.getId(), TipoParticipante.EMPRESA, "  Olá empresa  "));

        ArgumentCaptor<Mensagem> captor = ArgumentCaptor.forClass(Mensagem.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getRemetenteSocial()).isSameAs(usuario);
        assertThat(captor.getValue().getDestinatarioSocial()).isSameAs(empresa);
        assertThat(captor.getValue().getConteudo()).isEqualTo("Olá empresa");
        verify(notificacoes).criarOuAtualizar(any(), any(), anyString(), anyString(), eq(usuario));
    }

    @Test
    void rejeitaConteudoVazioSemGravarNada() {
        Usuario usuario = usuario();
        assertThatThrownBy(() -> service.enviar(
                usuario, new MensagemRequestDTO(UUID.randomUUID(), TipoParticipante.EMPRESA, "   ")))
                .hasMessageContaining("conteúdo");
        verifyNoInteractions(repository, notificacoes);
    }

    private Usuario usuario() {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setName("Ana");
        usuario.setEmail("ana@help.test");
        usuario.setSenha("Senha123");
        usuario.setAtivo(true);
        return usuario;
    }

    private Empresa empresa() {
        Empresa empresa = new Empresa();
        empresa.setId(UUID.randomUUID());
        empresa.setCorporateName("Empresa Help");
        empresa.setEmail("empresa@help.test");
        empresa.setCnpj("12345678000190");
        empresa.setPassword("Senha123");
        empresa.setAtivo(true);
        return empresa;
    }
}

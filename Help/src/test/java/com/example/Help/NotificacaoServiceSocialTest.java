package com.example.Help;

import com.example.Help.Service.NotificacaoService;
import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.notificacao.*;
import com.example.Help.model.social.TipoParticipante;
import com.example.Help.model.usuario.Usuario;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.*;

class NotificacaoServiceSocialTest {
    @Test
    void criaNotificacaoDeUsuarioParaEmpresaComTiposPreservados() {
        NotificacaoRepository repository = mock(NotificacaoRepository.class);
        NotificacaoService service = new NotificacaoService(repository);
        Empresa empresa = empresa();
        Usuario origem = usuario();

        service.criarOuAtualizar(empresa, TipoNotificacao.NOVA_MENSAGEM, "Mensagem", "Olá", origem);

        verify(repository).encontrarNaoLida(null, empresa.getId(), origem.getId(),
                TipoParticipante.USUARIO, TipoNotificacao.NOVA_MENSAGEM);
        verify(repository).save(argThat(n -> n.getEmpresa() == empresa && n.getUsuario() == null
                && n.getOrigemTipo() == TipoParticipante.USUARIO));
    }

    @Test
    void atualizaNotificacaoExistenteSemDuplicar() {
        NotificacaoRepository repository = mock(NotificacaoRepository.class);
        NotificacaoService service = new NotificacaoService(repository);
        Empresa empresa = empresa();
        Usuario origem = usuario();
        Notificacao existente = new Notificacao(empresa, TipoNotificacao.NOVA_MENSAGEM,
                "Antiga", "Anterior", origem.getId(), origem.getName(), TipoParticipante.USUARIO);
        when(repository.encontrarNaoLida(null, empresa.getId(), origem.getId(),
                TipoParticipante.USUARIO, TipoNotificacao.NOVA_MENSAGEM)).thenReturn(Optional.of(existente));

        service.criarOuAtualizar(empresa, TipoNotificacao.NOVA_MENSAGEM, "Nova", "Atual", origem);

        verify(repository).encontrarNaoLida(null, empresa.getId(), origem.getId(),
                TipoParticipante.USUARIO, TipoNotificacao.NOVA_MENSAGEM);
        verify(repository, times(1)).save(existente);
        verifyNoMoreInteractions(repository);
    }

    private Empresa empresa() {
        Empresa e = new Empresa(); e.setId(UUID.randomUUID()); e.setCorporateName("Empresa");
        e.setEmail("empresa@help.test"); e.setCnpj("12345678000190"); e.setPassword("Senha123"); e.setAtivo(true); return e;
    }

    private Usuario usuario() {
        Usuario u = new Usuario(); u.setId(UUID.randomUUID()); u.setName("Ana");
        u.setEmail("ana@help.test"); u.setSenha("Senha123"); u.setAtivo(true); return u;
    }
}

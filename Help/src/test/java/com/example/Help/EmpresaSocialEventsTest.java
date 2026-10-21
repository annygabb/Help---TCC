package com.example.Help;

import com.example.Help.Service.NotificacaoService;
import com.example.Help.Service.SeguidorService;
import com.example.Help.Service.VagaEmpresaService;
import com.example.Help.model.empresa.*;
import com.example.Help.model.notificacao.TipoNotificacao;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;

class EmpresaSocialEventsTest {
    @Test
    void novaVagaNotificaSeguidoresUsuariosEEmpresas() {
        VagaEmpresaRepository vagas = mock(VagaEmpresaRepository.class);
        SeguidorService seguidores = mock(SeguidorService.class);
        NotificacaoService notificacoes = mock(NotificacaoService.class);
        VagaEmpresaService service = new VagaEmpresaService(vagas, mock(UsuarioRepository.class), seguidores, notificacoes);
        Empresa origem = empresa("Empresa Origem");
        Usuario usuario = new Usuario(); usuario.setId(UUID.randomUUID()); usuario.setName("Ana"); usuario.setAtivo(true);
        Empresa outraEmpresa = empresa("Empresa Seguidora");
        when(vagas.save(any(VagaEmpresa.class))).thenAnswer(i -> i.getArgument(0));
        when(seguidores.listarParticipantesSeguidores(origem)).thenReturn(List.of(usuario, outraEmpresa));

        service.salvarVaga(origem, new VagaEmpresaRequestDTO("Desenvolvedor Java", List.of("Java"), 1, 5000d));

        verify(notificacoes).criarOuAtualizar(usuario, TipoNotificacao.NOVA_VAGA_EMPRESA,
                "Nova vaga de Empresa Origem", "Vaga publicada: Desenvolvedor Java", origem);
        verify(notificacoes).criarOuAtualizar(outraEmpresa, TipoNotificacao.NOVA_VAGA_EMPRESA,
                "Nova vaga de Empresa Origem", "Vaga publicada: Desenvolvedor Java", origem);
    }

    private Empresa empresa(String nome) {
        Empresa e = new Empresa(); e.setId(UUID.randomUUID()); e.setCorporateName(nome);
        e.setEmail(nome.replace(" ", "").toLowerCase() + "@help.test"); e.setCnpj("12345678000190");
        e.setPassword("Senha123"); e.setAtivo(true); return e;
    }
}

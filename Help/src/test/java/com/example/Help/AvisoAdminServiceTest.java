package com.example.Help;

import com.example.Help.Service.AvisoAdminService;
import com.example.Help.model.admin.*;
import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.notificacao.NotificacaoRepository;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AvisoAdminServiceTest {
    @Test
    void publicarParaTodosCriaNotificacaoParaUsuariosEEmpresasAtivos() {
        AvisoAdminRepository avisos = mock(AvisoAdminRepository.class);
        UsuarioRepository usuarios = mock(UsuarioRepository.class);
        EmpresaRepository empresas = mock(EmpresaRepository.class);
        NotificacaoRepository notificacoes = mock(NotificacaoRepository.class);
        Usuario usuario = new Usuario(); usuario.setAtivo(true);
        Empresa empresa = new Empresa(); empresa.setAtivo(true);
        when(usuarios.findAll()).thenReturn(List.of(usuario));
        when(empresas.findAll()).thenReturn(List.of(empresa));
        when(avisos.save(any())).thenAnswer(i -> i.getArgument(0));
        AvisoAdminService service = new AvisoAdminService(avisos, usuarios, empresas, notificacoes);

        var resposta = service.publicar(new AvisoAdminRequest("Aviso", "Mensagem", PublicoAviso.TODOS,
                "INFORMATIVA", "/feed"));

        assertThat(resposta.entregues()).isEqualTo(2);
        verify(notificacoes, times(2)).save(any());
    }
}

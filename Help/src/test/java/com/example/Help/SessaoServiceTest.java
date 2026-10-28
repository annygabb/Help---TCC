package com.example.Help;

import com.example.Help.Service.SessaoService;
import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class SessaoServiceTest {

    private UsuarioRepository usuarioRepository;
    private EmpresaRepository empresaRepository;
    private SessaoService service;

    @BeforeEach
    void configurar() {
        usuarioRepository = mock(UsuarioRepository.class);
        empresaRepository = mock(EmpresaRepository.class);
        service = new SessaoService(usuarioRepository, empresaRepository);
    }

    @Test
    void novoLoginDeOutraContaInvalidaUsuarioAnterior() {
        Usuario anterior = usuario(UUID.randomUUID(), "versao-anterior");
        Usuario nova = usuario(UUID.randomUUID(), "versao-nova");
        var autenticacao = new UsernamePasswordAuthenticationToken(anterior, null, anterior.getAuthorities());

        service.invalidarContaAnterior(autenticacao, nova);

        assertThat(anterior.getSessionVersion()).isNotBlank().isNotEqualTo("versao-anterior");
        verify(usuarioRepository).save(anterior);
        verifyNoInteractions(empresaRepository);
    }

    @Test
    void novoLoginDeUsuarioInvalidaEmpresaAnterior() {
        Empresa anterior = empresa(UUID.randomUUID(), "empresa-anterior");
        Usuario nova = usuario(UUID.randomUUID(), "usuario-novo");
        var autenticacao = new UsernamePasswordAuthenticationToken(anterior, null, anterior.getAuthorities());

        service.invalidarContaAnterior(autenticacao, nova);

        assertThat(anterior.getSessionVersion()).isNotBlank().isNotEqualTo("empresa-anterior");
        verify(empresaRepository).save(anterior);
        verifyNoInteractions(usuarioRepository);
    }

    @Test
    void reloginDaMesmaContaNaoFazGravacaoDuplicada() {
        UUID id = UUID.randomUUID();
        Usuario anterior = usuario(id, "atual");
        Usuario novaInstancia = usuario(id, "outra-instancia");
        var autenticacao = new UsernamePasswordAuthenticationToken(anterior, null, anterior.getAuthorities());

        service.invalidarContaAnterior(autenticacao, novaInstancia);

        assertThat(anterior.getSessionVersion()).isEqualTo("atual");
        verifyNoInteractions(usuarioRepository, empresaRepository);
    }

    private Usuario usuario(UUID id, String versao) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setEmail(id + "@teste.com");
        usuario.setSessionVersion(versao);
        return usuario;
    }

    private Empresa empresa(UUID id, String versao) {
        Empresa empresa = new Empresa();
        empresa.setId(id);
        empresa.setEmail(id + "@empresa.com");
        empresa.setSessionVersion(versao);
        return empresa;
    }
}

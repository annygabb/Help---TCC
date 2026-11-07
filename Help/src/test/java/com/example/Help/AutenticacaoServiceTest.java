package com.example.Help;

import com.example.Help.Service.AdminAccountService;
import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.recuperacao.AutenticacaoService;
import com.example.Help.model.usuario.TipoConta;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do AutenticacaoService")
class AutenticacaoServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private EmpresaRepository empresaRepository;

    @Mock
    private AdminAccountService adminAccountService;

    @InjectMocks
    private AutenticacaoService autenticacaoService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setName("Anny Gabrielly");
        usuario.setEmail("anny@email.com");
        usuario.setSenha("$2a$10$hash");
    }

    @Test
    @DisplayName("CT-UN-AUT-01: e-mail de candidato encontrado devolve a conta sincronizada")
    void devolveUsuarioSincronizado() {
        when(usuarioRepository.findByEmailIgnoreCase("anny@email.com")).thenReturn(Optional.of(usuario));
        when(adminAccountService.sincronizar(usuario)).thenReturn(usuario);

        UserDetails resultado = autenticacaoService.loadUserByUsername("anny@email.com");

        assertThat(resultado).isSameAs(usuario);
        assertThat(resultado.getUsername()).isEqualTo("anny@email.com");
    }

    @Test
    @DisplayName("CT-UN-AUT-02: e-mail com maiúsculas e espaços é normalizado antes da busca")
    void normalizaEmailAntesDeBuscar() {
        when(usuarioRepository.findByEmailIgnoreCase("anny@email.com")).thenReturn(Optional.of(usuario));
        when(adminAccountService.sincronizar(usuario)).thenReturn(usuario);

        autenticacaoService.loadUserByUsername("  ANNY@Email.COM  ");

        verify(usuarioRepository).findByEmailIgnoreCase("anny@email.com");
    }

    @Test
    @DisplayName("CT-UN-AUT-03: sem candidato com o e-mail, procura e devolve a empresa")
    void devolveEmpresaQuandoNaoHaCandidato() {
        Empresa empresa = new Empresa();
        empresa.setId(UUID.randomUUID());
        empresa.setEmail("rh@empresa.com");
        when(usuarioRepository.findByEmailIgnoreCase("rh@empresa.com")).thenReturn(Optional.empty());
        when(empresaRepository.findByEmailIgnoreCase("rh@empresa.com")).thenReturn(Optional.of(empresa));

        UserDetails resultado = autenticacaoService.loadUserByUsername("rh@empresa.com");

        assertThat(resultado).isSameAs(empresa);
        assertThat(resultado.getAuthorities()).extracting("authority").containsExactly("ROLE_EMPRESA");
        verify(adminAccountService, never()).sincronizar(any());
    }

    @Test
    @DisplayName("CT-UN-AUT-04: e-mail desconhecido lança UsernameNotFoundException com mensagem clara")
    void emailDesconhecidoLancaExcecao() {
        when(usuarioRepository.findByEmailIgnoreCase("nao@existe.com")).thenReturn(Optional.empty());
        when(empresaRepository.findByEmailIgnoreCase("nao@existe.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> autenticacaoService.loadUserByUsername("nao@existe.com"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("Usuário ou empresa não cadastrados com o e-mail informado.");
    }

    @Test
    @DisplayName("CT-UN-AUT-05: candidato comum tem a permissão ROLE_USER")
    void candidatoTemRoleUser() {
        when(usuarioRepository.findByEmailIgnoreCase("anny@email.com")).thenReturn(Optional.of(usuario));
        when(adminAccountService.sincronizar(usuario)).thenReturn(usuario);

        UserDetails resultado = autenticacaoService.loadUserByUsername("anny@email.com");

        assertThat(resultado.getAuthorities()).extracting("authority").containsExactly("ROLE_USER");
    }

    @Test
    @DisplayName("CT-UN-AUT-06: e-mail configurado como administrador é promovido a ROLE_ADMIN no login")
    void emailConfiguradoViraAdmin() {
        AdminAccountService adminReal = new AdminAccountService(usuarioRepository, " ANNY@email.com , outra@help.test ");
        AutenticacaoService servico = new AutenticacaoService(usuarioRepository, empresaRepository, adminReal);
        when(usuarioRepository.findByEmailIgnoreCase("anny@email.com")).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(usuario)).thenReturn(usuario);

        UserDetails resultado = servico.loadUserByUsername("anny@email.com");

        assertThat(((Usuario) resultado).getTipoConta()).isEqualTo(TipoConta.ADMIN);
        assertThat(resultado.getAuthorities()).extracting("authority").containsExactly("ROLE_ADMIN");
    }

    @Test
    @DisplayName("CT-UN-AUT-07: conta desativada continua sendo encontrada, mas fica bloqueada")
    void contaDesativadaFicaBloqueada() {
        usuario.setAtivo(false);
        when(usuarioRepository.findByEmailIgnoreCase("anny@email.com")).thenReturn(Optional.of(usuario));
        when(adminAccountService.sincronizar(usuario)).thenReturn(usuario);

        UserDetails resultado = autenticacaoService.loadUserByUsername("anny@email.com");

        assertThat(resultado.isEnabled()).isFalse();
        assertThat(resultado.isAccountNonLocked()).isFalse();
    }
}

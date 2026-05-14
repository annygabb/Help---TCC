package com.example.Help;

import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import com.example.Help.model.recuperacao.AutenticacaoService;
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
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do AutenticacaoService")
class AutenticacaoServiceTest {

    @InjectMocks
    private AutenticacaoService autenticacaoService;

    @Mock
    private UsuarioRepository usuarioRepository;

    private Usuario usuarioMock;

    @BeforeEach
    void setUp() {
        usuarioMock = new Usuario();
        usuarioMock.setId(UUID.randomUUID());
        usuarioMock.setName("Anny Gabrielly");
        usuarioMock.setEmail("anny@email.com");
        usuarioMock.setSenha("$2a$10$hash");
    }

    @Test
    @DisplayName("loadUserByUsername - deve retornar UserDetails quando e-mail encontrado")
    void loadUserByUsername_deveRetornarUserDetails_quandoEmailEncontrado() {
        when(usuarioRepository.findByEmail("anny@email.com")).thenReturn(Optional.of(usuarioMock));

        UserDetails resultado = autenticacaoService.loadUserByUsername("anny@email.com");

        assertThat(resultado).isNotNull();
        assertThat(resultado.getUsername()).isEqualTo("anny@email.com");
        verify(usuarioRepository, times(1)).findByEmail("anny@email.com");
    }

    @Test
    @DisplayName("loadUserByUsername - deve lançar UsernameNotFoundException quando e-mail não encontrado")
    void loadUserByUsername_deveLancarExcecao_quandoEmailNaoEncontrado() {
        when(usuarioRepository.findByEmail("naoexiste@email.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> autenticacaoService.loadUserByUsername("naoexiste@email.com"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("naoexiste@email.com");
    }

    @Test
    @DisplayName("loadUserByUsername - deve retornar o próprio objeto Usuario como UserDetails")
    void loadUserByUsername_deveRetornarInstanciaDeUsuario() {
        when(usuarioRepository.findByEmail("anny@email.com")).thenReturn(Optional.of(usuarioMock));

        UserDetails resultado = autenticacaoService.loadUserByUsername("anny@email.com");

        assertThat(resultado).isInstanceOf(Usuario.class);
        assertThat(((Usuario) resultado).getId()).isEqualTo(usuarioMock.getId());
    }

    @Test
    @DisplayName("loadUserByUsername - UserDetails deve ter role USER")
    void loadUserByUsername_deveConterRoleUser() {
        when(usuarioRepository.findByEmail("anny@email.com")).thenReturn(Optional.of(usuarioMock));

        UserDetails resultado = autenticacaoService.loadUserByUsername("anny@email.com");

        assertThat(resultado.getAuthorities())
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_USER"));
    }
}
package com.example.Help;

import com.example.Help.model.login.LoginRequestDTO;
import com.example.Help.model.recuperacao.TokenService;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRequestDTO;
import com.example.Help.model.usuario.UsuarioResponseDTO;
import com.example.Help.model.usuario.UsuarioController;
import com.example.Help.Service.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import java.util.UUID;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UsuarioController.class)
@DisplayName("Testes do UsuarioController")
class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UsuarioService service;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private TokenService tokenService;

    private UsuarioRequestDTO requestGenerico;
    private UsuarioResponseDTO responseGenerico;

    @BeforeEach
    void setup() {
        requestGenerico = new UsuarioRequestDTO(
                "Nome Teste",
                "teste@email.com",
                "senha123",
                "62999999999",
                "000.000.000-00",
                "Endereço Teste",
                "Bio de teste"
        );

        responseGenerico = new UsuarioResponseDTO(
                UUID.randomUUID(),
                "Nome Teste",
                "teste@email.com",
                "Desenvolvedor",
                "Goiás, Brasil",
                "Bio de teste"
        );
    }

    @Test
    @DisplayName("POST /usuarios/cadastro - deve retornar 201 ao salvar")
    void cadastrar_deveRetornar201_quandoSucesso() throws Exception {
        doNothing().when(service).salvar(any(UsuarioRequestDTO.class));

        mockMvc.perform(post("/usuarios/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestGenerico)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("POST /usuarios/login - deve retornar 200 e o token JWT")
    void login_deveRetornar200_quandoCredenciaisCorretas() throws Exception {
        LoginRequestDTO loginDTO = new LoginRequestDTO("teste@email.com", "senha123");

        Usuario usuarioMock = mock(Usuario.class);
        when(usuarioMock.getId()).thenReturn(UUID.randomUUID());
        when(usuarioMock.getName()).thenReturn("Usuário Teste");
        when(usuarioMock.getEmail()).thenReturn("teste@email.com");

        Authentication authMock = mock(Authentication.class);
        when(authMock.getPrincipal()).thenReturn(usuarioMock);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authMock);

        when(tokenService.gerarToken(any(Usuario.class))).thenReturn("token-jwt-fake");

        mockMvc.perform(post("/usuarios/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token-jwt-fake"));
    }

    @Test
    @DisplayName("GET /usuarios - deve listar todos os usuários")
    void listar_deveRetornarListaDeUsuarios() throws Exception {
        when(service.listarTodos()).thenReturn(List.of(responseGenerico));

        mockMvc.perform(get("/usuarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                // Verificando campos específicos do seu record
                .andExpect(jsonPath("$[0].name").value("Nome Teste"))
                .andExpect(jsonPath("$[0].jobRole").value("Desenvolvedor"));
    }

    @Test
    @DisplayName("POST /usuarios/gerar-token - deve chamar o serviço de recuperação")
    void gerarToken_deveRetornar200_quandoSucesso() throws Exception {
        doNothing().when(service).gerarTokenRecuperacao(anyString());

        mockMvc.perform(post("/usuarios/gerar-token")
                        .param("email", "teste@email.com"))
                .andExpect(status().isOk());

        verify(service, times(1)).gerarTokenRecuperacao("teste@email.com");
    }

    @Test
    @DisplayName("POST /usuarios/redefinir-senha - deve retornar 200 ao alterar senha")
    void redefinirSenha_deveRetornar200_quandoSucesso() throws Exception {
        doNothing().when(service).redefinirSenhaComToken(anyString(), anyString());

        mockMvc.perform(post("/usuarios/redefinir-senha")
                        .param("token", "123456")
                        .param("novaSenha", "novaSenha123"))
                .andExpect(status().isOk());
    }
}
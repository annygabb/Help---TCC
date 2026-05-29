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
import java.util.Map;
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
                "Nome Teste",          // nome -> name
                "teste@email.com",           // email
                "senha123",                  // password
                "Nome Completo do Teste",    // full_name
                "Desenvolvedor",             // job_role
                "Anápolis, Goiás",           // user_location
                "Ensino Superior",           // formacao
                "Java, Spring Boot, React",  // skills
                "Bio de teste profissional"  // user_bio
        );

        responseGenerico = new UsuarioResponseDTO(
                UUID.randomUUID(),           //id
                "Nome Teste",                //name
                "teste@email.com",           //email
                "62999999999",               //telefone
                "Anápolis",                  //cidade
                "Goiás",                     //estado
                "Desenvolvedor",             //cargo
                "Bio de teste profissional", //curriculo
                "Java, Spring Boot, React",  //skills
                1500.00                      //salarioBase
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
                .andExpect(jsonPath("$[0].name").value("Nome Teste"))
                .andExpect(jsonPath("$[0].cargo").value("Desenvolvedor")); // Valida a propriedade mapeada no DTO de resposta
    }

    @Test
    @DisplayName("POST /usuarios/gerar-token - deve chamar o serviço de recuperação")
    void gerarToken_deveRetornar200_quandoSucesso() throws Exception {
        doNothing().when(service).gerarTokenRecuperacao(anyString());

        Map<String, String> requestBody = Map.of("email", "teste@email.com");

        mockMvc.perform(post("/usuarios/gerar-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk());

        verify(service, times(1)).gerarTokenRecuperacao("teste@email.com");
    }

    @Test
    @DisplayName("POST /usuarios/redefinir-senha - deve retornar 200 ao alterar senha")
    void redefinirSenha_deveRetornar200_quandoSucesso() throws Exception {
        doNothing().when(service).redefinirSenhaComToken(anyString(), anyString());

        Map<String, String> requestBody = Map.of(
                "token", "123456",
                "novaSenha", "novaSenha123"
        );

        mockMvc.perform(post("/usuarios/redefinir-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk());
    }
}
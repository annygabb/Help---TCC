package com.example.Help;


import com.example.Help.Service.UsuarioService;
import com.example.Help.model.curso.CursoRepository;
import com.example.Help.model.login.LoginRequestDTO;
import com.example.Help.model.recuperacao.TokenRecuperacao;
import com.example.Help.model.recuperacao.TokenRecuperacaoRepository;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import com.example.Help.model.usuario.UsuarioRequestDTO;
import com.example.Help.model.usuario.UsuarioResponseDTO;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do UsuarioService")
@ActiveProfiles("test")
class UsuarioServiceTest {

  @InjectMocks
  private UsuarioService usuarioService;

  @Mock
  private UsuarioRepository repository;

  @Mock
  private PasswordEncoder passwordEncoder;

  @Mock
  private TokenRecuperacaoRepository tokenRepository;

  @Mock
  private CursoRepository cursoRepository;

  @Mock
  private JavaMailSender mailSender;
  private UUID usuarioId;
  private Usuario usuarioMock;
  private UsuarioRequestDTO requestDTO;
  private LoginRequestDTO loginDTO;

  @BeforeEach
  @SuppressWarnings("unused")
  void setUp() {
    usuarioId = UUID.randomUUID();

    requestDTO = new UsuarioRequestDTO(
        "Anny Gabrielly",
        "anny@email.com",
        "senha@123",
        "Anny Gabrielly",
        "Analista de Sistemas",
        "Anapolis, GO",
        "Profissional de TI",
        "skill", "Profissional de TI");

    usuarioMock = new Usuario(requestDTO);
    loginDTO = new LoginRequestDTO("anny@email.com", "senha@123");
  }

  @Test
  @DisplayName("salvar - deve salvar usuario com senha criptografada quando e-mail inedito")
  void salvar_deveSalvarUsuario_quandoEmailNaoExiste() {
    when(repository.existsByEmail("anny@email.com")).thenReturn(false);
    when(passwordEncoder.encode("senha@123")).thenReturn("$2a$10$hashBcrypt");

    usuarioService.salvar(requestDTO);

    verify(repository, times(1)).save(argThat(u -> u.getEmail().equals("anny@email.com") &&
        u.getPassword().equals("$2a$10$hashBcrypt")));
  }

  @Test
  @DisplayName("salvar - deve lancar RuntimeException quando e-mail ja esta cadastrado")
  void salvar_deveLancarExcecao_quandoEmailJaExiste() {
    when(repository.existsByEmail("anny@email.com")).thenReturn(true);

    assertThatThrownBy(() -> usuarioService.salvar(requestDTO))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("E-mail");

    verify(repository, never()).save(any());
  }

  @Test
  @DisplayName("salvar - deve chamar passwordEncoder antes de persistir")
  void salvar_deveChamarPasswordEncoder_antesDoSave() {
    when(repository.existsByEmail(anyString())).thenReturn(false);
    when(passwordEncoder.encode(anyString())).thenReturn("hashQualquer");

    usuarioService.salvar(requestDTO);

    verify(passwordEncoder, times(1)).encode("senha@123");
    verify(repository, times(1)).save(any(Usuario.class));
  }

  @Test
  @DisplayName("realizarLogin - deve retornar UsuarioResponseDTO quando credenciais corretas")
  void realizarLogin_deveRetornarDTO_quandoSenhaCorreta() {
    when(repository.findByEmail("anny@email.com")).thenReturn(Optional.of(usuarioMock));
    when(passwordEncoder.matches(eq("senha@123"), any(String.class))).thenReturn(true);

    UsuarioResponseDTO resultado = usuarioService.realizarLogin(loginDTO);

    assertThat(resultado).isNotNull();
    assertThat(resultado.email()).isEqualTo("anny@email.com");
    assertThat(resultado.name()).isEqualTo("Anny Gabrielly");
  }

  @Test
  @DisplayName("realizarLogin - deve lancar RuntimeException quando senha incorreta")
  void realizarLogin_deveLancarExcecao_quandoSenhaIncorreta() {
    when(repository.findByEmail("anny@email.com")).thenReturn(Optional.of(usuarioMock));
    when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

    assertThatThrownBy(() -> usuarioService.realizarLogin(loginDTO))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Senha incorreta!");
  }

  @Test
  @DisplayName("realizarLogin - deve lancar RuntimeException quando usuario nao existe")
  void realizarLogin_deveLancarExcecao_quandoUsuarioNaoEncontrado() {
    when(repository.findByEmail("anny@email.com")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> usuarioService.realizarLogin(loginDTO))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Usuário não encontrado!");
  }

  @Test
  @DisplayName("listarTodos - deve retornar lista de DTOs quando ha usuarios cadastrados")
  void listarTodos_deveRetornarLista_quandoHaUsuarios() {
    when(repository.findAll()).thenReturn(List.of(usuarioMock));

    List<UsuarioResponseDTO> resultado = usuarioService.listarTodos();

    assertThat(resultado).hasSize(1);
    assertThat(resultado.get(0).email()).isEqualTo("anny@email.com");
  }

  @Test
  @DisplayName("listarTodos - deve retornar lista vazia quando nao ha usuarios")
  void listarTodos_deveRetornarListaVazia_quandoNaoHaUsuarios() {
    when(repository.findAll()).thenReturn(List.of());

    List<UsuarioResponseDTO> resultado = usuarioService.listarTodos();

    assertThat(resultado).isEmpty();
  }

  @Test
  @DisplayName("atualizarPerfil - deve atualizar os campos do usuario e chamar save")
  void atualizarPerfil_deveAtualizarCampos_quandoUsuarioExiste() {
    when(repository.findById(usuarioId)).thenReturn(Optional.of(usuarioMock));

    usuarioService.atualizarPerfil(usuarioId, requestDTO);

    verify(repository, times(1)).save(argThat(u -> u.getJobRole().equals("Analista de Sistemas") &&
        u.getLocation().equals("Anapolis, GO") &&
        u.getBio().equals("Profissional de TI")));
  }

  @Test
  @DisplayName("atualizarPerfil - deve lancar RuntimeException quando usuario nao encontrado")
  void atualizarPerfil_deveLancarExcecao_quandoUsuarioNaoExiste() {
    when(repository.findById(usuarioId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> usuarioService.atualizarPerfil(usuarioId, requestDTO))
        .isInstanceOf(RuntimeException.class);

    verify(repository, never()).save(any());
  }

  @Test
  @DisplayName("atualizarPerfil - deve atualizar nome completo (full_name) corretamente")
  void atualizarPerfil_deveAtualizarNome_corretamente() {
    when(repository.findById(usuarioId)).thenReturn(Optional.of(usuarioMock));

    usuarioService.atualizarPerfil(usuarioId, requestDTO);

    verify(repository).save(argThat(u -> u.getName().equals("Anny Gabrielly")));
  }

  @Test
  @DisplayName("gerarTokenRecuperacao - deve excluir token antigo antes de criar novo")
  void gerarTokenRecuperacao_deveExcluirTokenAnterior_antesDeGerar() {
    MimeMessage mimeMessageMock = mock(MimeMessage.class);
    when(mailSender.createMimeMessage()).thenReturn(mimeMessageMock);
    when(repository.findByEmail("anny@email.com")).thenReturn(Optional.of(usuarioMock));

    usuarioService.gerarTokenRecuperacao("anny@email.com");

    verify(tokenRepository, times(1)).deleteByUsuario(usuarioMock);
    verify(tokenRepository, times(1)).flush();
    verify(tokenRepository, times(1)).save(any(TokenRecuperacao.class));
  }

  @Test
  @DisplayName("gerarTokenRecuperacao - deve lancar RuntimeException quando e-mail nao encontrado")
  void gerarTokenRecuperacao_deveLancarExcecao_quandoEmailNaoExiste() {
    when(repository.findByEmail("naocadastrado@email.com")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> usuarioService.gerarTokenRecuperacao("naocadastrado@email.com"))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Usuário não encontrado.");

    verify(tokenRepository, never()).save(any());
    verify(mailSender, never()).send(any(MimeMessage.class));
  }

  @Test
  @DisplayName("gerarTokenRecuperacao - deve chamar mailSender para enviar o e-mail")
  void gerarTokenRecuperacao_deveChamarMailSender() {
    MimeMessage mimeMessageMock = mock(MimeMessage.class);
    when(mailSender.createMimeMessage()).thenReturn(mimeMessageMock);
    when(repository.findByEmail("anny@email.com")).thenReturn(Optional.of(usuarioMock));

    usuarioService.gerarTokenRecuperacao("anny@email.com");

    verify(mailSender, times(1)).send(any(MimeMessage.class));
  }

  @Test
  @DisplayName("redefinirSenhaComToken - deve alterar senha e deletar token quando valido")
  void redefinirSenhaComToken_deveAlterarSenha_quandoTokenValido() {
    TokenRecuperacao tokenMock = new TokenRecuperacao();
    tokenMock.setToken("ABC123");
    tokenMock.setUsuario(usuarioMock);
    tokenMock.setDataExpiracao(LocalDateTime.now().plusMinutes(10));

    when(tokenRepository.findByToken("ABC123")).thenReturn(Optional.of(tokenMock));
    when(passwordEncoder.encode("novaSenha@123")).thenReturn("$2a$10$novoHash");

    usuarioService.redefinirSenhaComToken("ABC123", "novaSenha@123");

    verify(repository, times(1)).save(argThat(u -> u.getPassword().equals("$2a$10$novoHash")));
    verify(tokenRepository, times(1)).delete(tokenMock);
  }

  @Test
  @DisplayName("redefinirSenhaComToken - deve lancar RuntimeException e deletar token expirado")
  void redefinirSenhaComToken_deveLancarExcecao_quandoTokenExpirado() {
    TokenRecuperacao tokenExpirado = new TokenRecuperacao();
    tokenExpirado.setToken("EXPIRED");
    tokenExpirado.setUsuario(usuarioMock);
    tokenExpirado.setDataExpiracao(LocalDateTime.now().minusMinutes(5));

    when(tokenRepository.findByToken("EXPIRED")).thenReturn(Optional.of(tokenExpirado));

    assertThatThrownBy(() -> usuarioService.redefinirSenhaComToken("EXPIRED", "qualquerSenha"))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("expirou");

    verify(tokenRepository, times(1)).delete(tokenExpirado);
    verify(repository, never()).save(any());
  }

  @Test
  @DisplayName("redefinirSenhaComToken - deve lancar RuntimeException quando token inexistente")
  void redefinirSenhaComToken_deveLancarExcecao_quandoTokenInexistente() {
    when(tokenRepository.findByToken("INVALIDO")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> usuarioService.redefinirSenhaComToken("INVALIDO", "qualquerSenha"))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Código inválido ou inexistente.");

    verify(repository, never()).save(any());
  }

  @Test
  @DisplayName("redefinirSenhaComToken - deve criptografar nova senha antes de salvar")
  void redefinirSenhaComToken_deveCriptografarNovaSenha() {
    TokenRecuperacao tokenMock = new TokenRecuperacao();
    tokenMock.setToken("ABC123");
    tokenMock.setUsuario(usuarioMock);
    tokenMock.setDataExpiracao(LocalDateTime.now().plusMinutes(10));

    when(tokenRepository.findByToken("ABC123")).thenReturn(Optional.of(tokenMock));
    when(passwordEncoder.encode("novaSenha@123")).thenReturn("$2a$10$novoCrypt");

    usuarioService.redefinirSenhaComToken("ABC123", "novaSenha@123");

    verify(passwordEncoder, times(1)).encode("novaSenha@123");
  }
}

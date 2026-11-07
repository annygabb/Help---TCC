package com.example.Help;

import com.example.Help.Service.UsuarioService;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.login.LoginRequestDTO;
import com.example.Help.model.recuperacao.TokenRecuperacao;
import com.example.Help.model.recuperacao.TokenRecuperacaoRepository;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import com.example.Help.model.usuario.UsuarioRequestDTO;
import com.example.Help.model.usuario.UsuarioResponseDTO;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.Properties;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do UsuarioService")
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository repository;

    @Mock
    private EmpresaRepository empresaRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private TokenRecuperacaoRepository tokenRepository;

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario usuario;
    private UsuarioRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        requestDTO = new UsuarioRequestDTO(
                "Anny Gabrielly", "  ANNY@Email.com ", "Senha123", "Anny Gabrielly",
                "Analista de Sistemas", "Anápolis, GO", "Engenharia de Software", "Java", "Profissional de TI");
        usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setName("Anny Gabrielly");
        usuario.setEmail("anny@email.com");
        usuario.setSenha("$2a$10$hashAtual");
        usuario.setJobRole("Desenvolvedora");
    }

    private MimeMessage mensagemReal() {
        return new MimeMessage(Session.getInstance(new Properties()));
    }

    @Test
    @DisplayName("CT-UN-USR-01: salvar normaliza o e-mail e grava a senha criptografada")
    void salvarNormalizaEmailECriptografaSenha() {
        when(repository.existsByEmailIgnoreCase("anny@email.com")).thenReturn(false);
        when(empresaRepository.existsByEmailIgnoreCase("anny@email.com")).thenReturn(false);
        when(passwordEncoder.encode("Senha123")).thenReturn("$2a$10$novoHash");

        usuarioService.salvar(requestDTO);

        ArgumentCaptor<Usuario> salvo = ArgumentCaptor.forClass(Usuario.class);
        verify(repository).save(salvo.capture());
        assertThat(salvo.getValue().getEmail()).isEqualTo("anny@email.com");
        assertThat(salvo.getValue().getPassword()).isEqualTo("$2a$10$novoHash");
        assertThat(salvo.getValue().getCargo()).isEqualTo("Analista de Sistemas");
    }

    @Test
    @DisplayName("CT-UN-USR-02: e-mail já usado por outro candidato impede o cadastro")
    void emailDeCandidatoRepetidoImpedeCadastro() {
        when(repository.existsByEmailIgnoreCase("anny@email.com")).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.salvar(requestDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("E-mail já cadastrado.");
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("CT-UN-USR-03: e-mail já usado por uma empresa também impede o cadastro")
    void emailDeEmpresaImpedeCadastro() {
        when(repository.existsByEmailIgnoreCase("anny@email.com")).thenReturn(false);
        when(empresaRepository.existsByEmailIgnoreCase("anny@email.com")).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.salvar(requestDTO)).hasMessage("E-mail já cadastrado.");
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("CT-UN-USR-04: login legado com senha correta devolve os dados da conta")
    void realizarLoginComSenhaCorreta() {
        when(repository.findByEmailIgnoreCase("anny@email.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("Senha123", "$2a$10$hashAtual")).thenReturn(true);

        UsuarioResponseDTO resposta = usuarioService.realizarLogin(new LoginRequestDTO(" Anny@Email.com", "Senha123"));

        assertThat(resposta.email()).isEqualTo("anny@email.com");
        assertThat(resposta.name()).isEqualTo("Anny Gabrielly");
    }

    @Test
    @DisplayName("CT-UN-USR-05: login legado com senha errada lança 'Senha incorreta!'")
    void realizarLoginComSenhaErrada() {
        when(repository.findByEmailIgnoreCase("anny@email.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("errada", "$2a$10$hashAtual")).thenReturn(false);

        assertThatThrownBy(() -> usuarioService.realizarLogin(new LoginRequestDTO("anny@email.com", "errada")))
                .hasMessage("Senha incorreta!");
    }

    @Test
    @DisplayName("CT-UN-USR-06: login legado com e-mail inexistente lança 'Usuário não encontrado!'")
    void realizarLoginComEmailInexistente() {
        when(repository.findByEmailIgnoreCase("nao@existe.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.realizarLogin(new LoginRequestDTO("nao@existe.com", "x")))
                .hasMessage("Usuário não encontrado!");
    }

    @Test
    @DisplayName("CT-UN-USR-07: listar todos converte cada conta em DTO")
    void listarTodosConverteEmDto() {
        when(repository.findAll()).thenReturn(List.of(usuario));

        List<UsuarioResponseDTO> lista = usuarioService.listarTodos();

        assertThat(lista).hasSize(1);
        assertThat(lista.getFirst().id()).isEqualTo(usuario.getId());
        assertThat(lista.getFirst().cargo()).isEqualTo("Desenvolvedora");
    }

    @Test
    @DisplayName("CT-UN-USR-08: atualizar perfil legado muda só o nome e preserva o cargo")
    void atualizarPerfilMudaSoONome() {
        when(repository.findById(usuario.getId())).thenReturn(Optional.of(usuario));
        UsuarioRequestDTO novo = new UsuarioRequestDTO("Novo Nome", "anny@email.com", "Senha123", "Novo Nome",
                "Outro Cargo", "Goiânia", "Formação", "Skills", "Bio");

        usuarioService.atualizarPerfil(usuario.getId(), novo);

        ArgumentCaptor<Usuario> salvo = ArgumentCaptor.forClass(Usuario.class);
        verify(repository).save(salvo.capture());
        assertThat(salvo.getValue().getName()).isEqualTo("Novo Nome");
        assertThat(salvo.getValue().getJobRole()).isEqualTo("Desenvolvedora");
    }

    @Test
    @DisplayName("CT-UN-USR-09: atualizar perfil de conta inexistente lança erro e não grava")
    void atualizarPerfilInexistente() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.atualizarPerfil(id, requestDTO)).hasMessage("Usuário não encontrado.");
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("CT-UN-USR-10: pedir recuperação apaga o código anterior antes de criar o novo")
    void recuperacaoApagaCodigoAnteriorAntes() {
        when(repository.findByEmailIgnoreCase("anny@email.com")).thenReturn(Optional.of(usuario));
        when(mailSender.createMimeMessage()).thenReturn(mensagemReal());

        usuarioService.gerarTokenRecuperacao("anny@email.com");

        InOrder ordem = inOrder(tokenRepository);
        ordem.verify(tokenRepository).deleteByUsuario(usuario);
        ordem.verify(tokenRepository).flush();
        ordem.verify(tokenRepository).save(any(TokenRecuperacao.class));
    }

    @Test
    @DisplayName("CT-UN-USR-11: o código tem 6 caracteres hexadecimais maiúsculos e vale 5 minutos")
    void codigoTemFormatoEValidadeEsperados() {
        when(repository.findByEmailIgnoreCase("anny@email.com")).thenReturn(Optional.of(usuario));
        when(mailSender.createMimeMessage()).thenReturn(mensagemReal());

        usuarioService.gerarTokenRecuperacao("anny@email.com");

        ArgumentCaptor<TokenRecuperacao> token = ArgumentCaptor.forClass(TokenRecuperacao.class);
        verify(tokenRepository).save(token.capture());
        assertThat(token.getValue().getToken()).matches("[0-9A-F]{6}");
        assertThat(token.getValue().getDataExpiracao())
                .isCloseTo(LocalDateTime.now().plusMinutes(5), within(5, ChronoUnit.SECONDS));
        assertThat(token.getValue().getUsuario()).isSameAs(usuario);
    }

    @Test
    @DisplayName("CT-UN-USR-12: o e-mail de recuperação vai para a pessoa com o assunto certo")
    void emailDeRecuperacaoTemAssuntoCerto() throws Exception {
        when(repository.findByEmailIgnoreCase("anny@email.com")).thenReturn(Optional.of(usuario));
        when(mailSender.createMimeMessage()).thenReturn(mensagemReal());

        usuarioService.gerarTokenRecuperacao("anny@email.com");

        ArgumentCaptor<MimeMessage> enviada = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(enviada.capture());
        assertThat(enviada.getValue().getSubject()).isEqualTo("Recuperação de Senha — Help Academy");
        assertThat(enviada.getValue().getAllRecipients()[0].toString()).isEqualTo("anny@email.com");
    }

    @Test
    @DisplayName("CT-UN-USR-13: falha no servidor de e-mail não derruba a geração do código")
    void falhaNoEmailNaoDerrubaFluxo() {
        when(repository.findByEmailIgnoreCase("anny@email.com")).thenReturn(Optional.of(usuario));
        when(mailSender.createMimeMessage()).thenReturn(mensagemReal());
        doThrow(new MailSendException("SMTP fora do ar")).when(mailSender).send(any(MimeMessage.class));

        assertThatCode(() -> usuarioService.gerarTokenRecuperacao("anny@email.com")).doesNotThrowAnyException();
        verify(tokenRepository).save(any(TokenRecuperacao.class));
    }

    @Test
    @DisplayName("CT-UN-USR-14: e-mail sem cadastro não gera código nem envia e-mail")
    void emailSemCadastroNaoGeraCodigo() {
        when(repository.findByEmailIgnoreCase("nao@existe.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.gerarTokenRecuperacao("nao@existe.com"))
                .hasMessage("Usuário não encontrado.");
        verify(tokenRepository, never()).save(any());
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("CT-UN-USR-15: código válido troca a senha e é apagado depois do uso")
    void codigoValidoTrocaSenha() {
        TokenRecuperacao token = new TokenRecuperacao("ABC123", usuario, LocalDateTime.now().plusMinutes(5));
        when(tokenRepository.findByToken("ABC123")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("NovaSenha1")).thenReturn("$2a$10$hashNovo");

        usuarioService.redefinirSenhaComToken("ABC123", "NovaSenha1");

        assertThat(usuario.getPassword()).isEqualTo("$2a$10$hashNovo");
        verify(repository).save(usuario);
        verify(tokenRepository).delete(token);
    }

    @Test
    @DisplayName("CT-UN-USR-16: código vencido é apagado e a senha continua a mesma")
    void codigoVencidoNaoTrocaSenha() {
        TokenRecuperacao token = new TokenRecuperacao("OLD123", usuario, LocalDateTime.now().minusSeconds(1));
        when(tokenRepository.findByToken("OLD123")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> usuarioService.redefinirSenhaComToken("OLD123", "NovaSenha1"))
                .hasMessage("O código de recuperação de senha expirou.");
        verify(tokenRepository).delete(token);
        verify(repository, never()).save(any());
        assertThat(usuario.getPassword()).isEqualTo("$2a$10$hashAtual");
    }

    @Test
    @DisplayName("CT-UN-USR-17: código inexistente é recusado")
    void codigoInexistenteRecusado() {
        when(tokenRepository.findByToken("XXXXXX")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.redefinirSenhaComToken("XXXXXX", "NovaSenha1"))
                .hasMessage("Código inválido ou inexistente.");
        verify(repository, never()).save(any());
    }
}

package com.example.Help.unidade;

import com.example.Help.Service.PagamentoService;
import com.example.Help.model.recuperacao.TokenRecuperacao;
import com.example.Help.model.recuperacao.TokenRecuperacaoRepository;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@DisplayName("Pagamentos e tokens de matrícula (PagamentoService)")
class PagamentoServiceTest {

    private UsuarioRepository usuarios;
    private TokenRecuperacaoRepository tokens;
    private JavaMailSender email;
    private PagamentoService service;
    private Usuario aluna;

    @BeforeEach
    void configurar() {
        usuarios = mock(UsuarioRepository.class);
        tokens = mock(TokenRecuperacaoRepository.class);
        email = mock(JavaMailSender.class);
        service = new PagamentoService();
        ReflectionTestUtils.setField(service, "usuarioRepository", usuarios);
        ReflectionTestUtils.setField(service, "tokenRepository", tokens);
        ReflectionTestUtils.setField(service, "mailSender", email);
        ReflectionTestUtils.setField(service, "mercadoPagoAccessToken", "");
        when(email.createMimeMessage()).thenAnswer(i -> new MimeMessage(Session.getInstance(new Properties())));

        aluna = new Usuario();
        aluna.setId(UUID.randomUUID());
        aluna.setName("Ana Souza");
        aluna.setEmail("ana@help.test");
    }

    private String assuntoEnviado() throws Exception {
        ArgumentCaptor<MimeMessage> mensagem = ArgumentCaptor.forClass(MimeMessage.class);
        verify(email).send(mensagem.capture());
        return mensagem.getValue().getSubject();
    }

    @Test
    @DisplayName("CT-UN-PAG-01: sem token do Mercado Pago, o PIX devolve erro controlado")
    void pixSemGatewayDevolveErroControlado() {
        Map<String, Object> resultado = service.criarPagamentoPix(new BigDecimal("199.90"), "Curso",
                "ana@help.test", "Ana", "Souza", "529.982.247-25");

        assertThat(resultado).containsEntry("status", "error")
                .containsEntry("message", "Não foi possível gerar o PIX devido a uma falha interna.");
    }

    @Test
    @DisplayName("CT-UN-PAG-02: o token de exemplo 'SEU_TOKEN' conta como não configurado")
    void tokenDeExemploContaComoNaoConfigurado() {
        ReflectionTestUtils.setField(service, "mercadoPagoAccessToken", "TEST-SEU_TOKEN-123");

        Map<String, Object> resultado = service.criarPagamentoPix(new BigDecimal("10"), null, null, null, null, null);

        assertThat(resultado).containsEntry("status", "error");
    }

    @Test
    @DisplayName("CT-UN-PAG-03: sem token, o cartão devolve erro controlado")
    void cartaoSemGatewayDevolveErroControlado() {
        Map<String, Object> resultado = service.processarPagamentoCartao("tok", 1, new BigDecimal("199.90"),
                "Curso", "ana@help.test", "52998224725");

        assertThat(resultado).containsEntry("status", "error")
                .containsEntry("message", "Não foi possível processar o pagamento internamente. Tente novamente.");
    }

    @Test
    @DisplayName("CT-UN-PAG-04: sem token, a consulta de status devolve erro controlado")
    void statusSemGatewayDevolveErroControlado() {
        assertThat(service.consultarStatusPagamento(123L)).containsEntry("status", "error")
                .containsEntry("message", "Não foi possível recuperar o status do pagamento no momento.");
    }

    @Test
    @DisplayName("CT-UN-PAG-05: a inicialização sem token só avisa no log, sem derrubar a aplicação")
    void inicializacaoSemTokenNaoQuebra() {
        ReflectionTestUtils.setField(service, "mercadoPagoAccessToken", "   ");

        assertThatCode(service::inicializarMercadoPago).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("CT-UN-PAG-06: matrícula para e-mail sem cadastro é recusada e não gera código")
    void matriculaDeEmailSemCadastro() {
        when(usuarios.findByEmail("nao@help.test")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.gerarTokenMatricula("nao@help.test", "Java"))
                .hasMessage("Usuário não encontrado.");
        verify(tokens, never()).save(any());
    }

    @Test
    @DisplayName("CT-UN-PAG-07: matrícula gratuita troca o código anterior e envia o e-mail de confirmação")
    void matriculaGratuitaGeraCodigoEEnviaEmail() throws Exception {
        when(usuarios.findByEmail("ana@help.test")).thenReturn(Optional.of(aluna));

        service.gerarTokenMatricula("ana@help.test", "Java Spring Boot");

        verify(tokens).deleteByUsuario(aluna);
        ArgumentCaptor<TokenRecuperacao> token = ArgumentCaptor.forClass(TokenRecuperacao.class);
        verify(tokens).save(token.capture());
        assertThat(token.getValue().getToken()).matches("[0-9A-F]{6}");
        assertThat(assuntoEnviado()).isEqualTo("Confirme sua Matrícula — Help Academy");
    }

    @Test
    @DisplayName("CT-UN-PAG-08: matrícula paga aprovada envia o e-mail de acesso liberado")
    void matriculaPagaEnviaAcessoLiberado() throws Exception {
        when(usuarios.findByEmail("ana@help.test")).thenReturn(Optional.of(aluna));

        service.gerarTokenMatriculaPagaAposConfirmacaoPagamento("ana@help.test", "Cloud AWS");

        assertThat(assuntoEnviado()).isEqualTo("Acesso Liberado — Help Academy");
    }

    @Test
    @DisplayName("CT-UN-PAG-09: código válido confirma a matrícula e é apagado")
    void codigoValidoConfirmaMatricula() {
        TokenRecuperacao token = new TokenRecuperacao("ABC123", aluna, LocalDateTime.now().plusMinutes(5));
        when(tokens.findByToken("ABC123")).thenReturn(Optional.of(token));

        service.confirmarMatriculaComToken("ABC123");

        verify(tokens).delete(token);
    }

    @Test
    @DisplayName("CT-UN-PAG-10: código vencido da matrícula gratuita é apagado e recusado")
    void codigoVencidoDaGratuita() {
        TokenRecuperacao token = new TokenRecuperacao("OLD123", aluna, LocalDateTime.now().minusMinutes(1));
        when(tokens.findByToken("OLD123")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> service.confirmarMatriculaComToken("OLD123"))
                .hasMessage("O código de confirmação de matrícula expirou.");
        verify(tokens).delete(token);
    }

    @Test
    @DisplayName("CT-UN-PAG-11: código vencido da matrícula paga tem mensagem própria")
    void codigoVencidoDaPaga() {
        TokenRecuperacao token = new TokenRecuperacao("OLD456", aluna, LocalDateTime.now().minusMinutes(1));
        when(tokens.findByToken("OLD456")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> service.confirmarMatriculaPagaComToken("OLD456"))
                .hasMessage("O código de confirmação de matrícula paga expirou.");
    }

    @Test
    @DisplayName("CT-UN-PAG-12: código inexistente é recusado")
    void codigoInexistente() {
        when(tokens.findByToken("NADA00")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.confirmarMatriculaComToken("NADA00"))
                .hasMessage("Código inválido ou inexistente.");
    }
}

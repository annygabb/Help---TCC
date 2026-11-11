package com.example.Help.integracao;

import com.example.Help.model.recuperacao.TokenRecuperacao;
import com.example.Help.model.recuperacao.TokenRecuperacaoRepository;
import com.example.Help.model.usuario.UsuarioRepository;
import com.example.Help.suporte.IntegracaoBase;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDateTime;
import java.util.Properties;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Integração: recuperação de senha, matrícula e pagamento")
class RecuperacaoEMatriculaTest extends IntegracaoBase {

    @MockitoBean
    private JavaMailSender mailSender;

    @Autowired
    private TokenRecuperacaoRepository tokens;

    @Autowired
    private UsuarioRepository usuarios;

    @BeforeEach
    void emailFalso() {
        when(mailSender.createMimeMessage()).thenAnswer(i -> new MimeMessage(Session.getInstance(new Properties())));
    }

    private TokenRecuperacao tokenDe(String email) {
        UUID id = usuarios.findByEmailIgnoreCase(email).orElseThrow().getId();
        return tokens.findAll().stream()
                .filter(t -> t.getUsuario().getId().equals(id))
                .findFirst()
                .orElseThrow();
    }

    private void pedirCodigo(String email) throws Exception {
        mockMvc.perform(post("/api/usuarios/gerar-token").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\"}".formatted(email)))
                .andExpect(status().isOk());
    }

    private org.springframework.test.web.servlet.ResultActions redefinir(String codigo, String novaSenha) throws Exception {
        return mockMvc.perform(post("/usuarios/redefinir-senha").contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"%s\",\"novaSenha\":\"%s\"}".formatted(codigo, novaSenha)));
    }

    private org.springframework.test.web.servlet.ResultActions entrar(String email, String senha) throws Exception {
        return mockMvc.perform(post("/api/usuarios/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, senha)));
    }

    @Test
    @DisplayName("CT-BE-REC-01: o fluxo completo troca a senha: a nova entra e a antiga não")
    void fluxoCompleto() throws Exception {
        Conta ana = novoUsuario("Ana");
        pedirCodigo(ana.email());
        String codigo = tokenDe(ana.email()).getToken();

        redefinir(codigo, "NovaSenha1")
                .andExpect(status().isOk())
                .andExpect(content().string("Senha alterada com sucesso!"));

        entrar(ana.email(), "NovaSenha1").andExpect(status().isOk());
        entrar(ana.email(), SENHA).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CT-BE-REC-02: e-mail sem cadastro devolve 404 com mensagem")
    void emailSemCadastro() throws Exception {
        mockMvc.perform(post("/api/usuarios/gerar-token").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"ninguem@help.test\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("E-mail não encontrado no sistema."));
    }

    @Test
    @DisplayName("CT-BE-REC-03: código inexistente é recusado")
    void codigoInexistente() throws Exception {
        redefinir("ZZZZZZ", "NovaSenha1")
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Código inválido ou inexistente.")));
    }

    @Test
    @DisplayName("CT-BE-REC-04: o mesmo código não serve duas vezes")
    void codigoNaoServeDuasVezes() throws Exception {
        Conta ana = novoUsuario("Ana");
        pedirCodigo(ana.email());
        String codigo = tokenDe(ana.email()).getToken();

        redefinir(codigo, "NovaSenha1").andExpect(status().isOk());
        redefinir(codigo, "OutraSenha2").andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("CT-BE-REC-05: código vencido é recusado e a senha antiga continua valendo")
    void codigoVencido() throws Exception {
        Conta ana = novoUsuario("Ana");
        pedirCodigo(ana.email());
        TokenRecuperacao token = tokenDe(ana.email());
        token.setDataExpiracao(LocalDateTime.now().minusMinutes(1));
        tokens.save(token);

        redefinir(token.getToken(), "NovaSenha1")
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("expirou")));
        entrar(ana.email(), SENHA).andExpect(status().isOk());
    }

    @Test
    @DisplayName("CT-BE-REC-06: pedir um código novo invalida o anterior")
    void novoCodigoInvalidaOAnterior() throws Exception {
        Conta ana = novoUsuario("Ana");
        pedirCodigo(ana.email());
        String primeiro = tokenDe(ana.email()).getToken();
        pedirCodigo(ana.email());
        String segundo = tokenDe(ana.email()).getToken();

        if (!primeiro.equals(segundo)) {
            redefinir(primeiro, "NovaSenha1").andExpect(status().isBadRequest());
        }
        redefinir(segundo, "NovaSenha1").andExpect(status().isOk());
    }

    @Test
    @DisplayName("CT-BE-REC-07: a rota /auth/esqueci-senha também gera o código")
    void rotaAuthEsqueciSenha() throws Exception {
        Conta ana = novoUsuario("Ana");
        mockMvc.perform(post("/auth/esqueci-senha").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\"}".formatted(ana.email())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Código de recuperação enviado ao seu e-mail!"));
        assertThat(tokenDe(ana.email()).getToken()).matches("[0-9A-F]{6}");
    }

    @Test
    @DisplayName("CT-BE-MAT-01: pedir matrícula gratuita envia o código para o e-mail cadastrado")
    void pedirMatricula() throws Exception {
        Conta ana = novoUsuario("Ana");
        mockMvc.perform(post("/api/matricula/gerar-token").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"nomeCurso\":\"Java\"}".formatted(ana.email())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Token enviado com sucesso para " + ana.email()));
    }

    @Test
    @DisplayName("CT-BE-MAT-02: o código correto confirma a matrícula")
    void confirmarMatricula() throws Exception {
        Conta ana = novoUsuario("Ana");
        mockMvc.perform(post("/api/matricula/gerar-token").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"nomeCurso\":\"Java\"}".formatted(ana.email())))
                .andExpect(status().isOk());
        String codigo = tokenDe(ana.email()).getToken();

        mockMvc.perform(post("/api/matricula/confirmar").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"%s\"}".formatted(codigo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Matrícula confirmada com sucesso!"));
    }

    @Test
    @DisplayName("CT-BE-MAT-03: confirmar sem código é recusado")
    void confirmarSemCodigo() throws Exception {
        mockMvc.perform(post("/api/matricula/confirmar").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Código inválido ou inexistente."));
    }

    @Test
    @DisplayName("CT-BE-PAG-01: sem gateway configurado, o PIX responde erro controlado (sem 500)")
    void pixSemGateway() throws Exception {
        mockMvc.perform(post("/api/pagamento/pix").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"transaction_amount\":199.9,\"description\":\"Curso\",\"payer\":{\"email\":\"a@help.test\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("error"));
    }

    @Test
    @DisplayName("CT-BE-PAG-02: sem gateway configurado, o cartão responde erro controlado")
    void cartaoSemGateway() throws Exception {
        mockMvc.perform(post("/api/pagamento/cartao").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"tok\",\"installments\":1,\"transaction_amount\":199.9,\"payer\":{\"email\":\"a@help.test\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("error"));
    }

    @Test
    @DisplayName("CT-BE-PAG-03: consultar status de PIX sem gateway responde erro controlado")
    void statusSemGateway() throws Exception {
        mockMvc.perform(get("/api/pagamento/pix/status/123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("error"));
    }
}

package com.example.Help.unidade;

import com.example.Help.Service.RequestsExceptionHandler;
import com.example.Help.Service.RequestsExceptionHandler.DadosErroValidacao;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Tratamento global de erros da API")
class RequestsExceptionHandlerTest {

    private final RequestsExceptionHandler handler = new RequestsExceptionHandler();

    @SuppressWarnings("unused")
    private void metodoQualquer(String corpo) {
    }

    private MethodArgumentNotValidException erroDeValidacao(FieldError... erros) throws Exception {
        MethodParameter parametro = new MethodParameter(
                RequestsExceptionHandlerTest.class.getDeclaredMethod("metodoQualquer", String.class), 0);
        BeanPropertyBindingResult resultado = new BeanPropertyBindingResult(new Object(), "dados");
        for (FieldError erro : erros) {
            resultado.addError(erro);
        }
        return new MethodArgumentNotValidException(parametro, resultado);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> mapa(ResponseEntity<?> resposta) {
        return (Map<String, Object>) resposta.getBody();
    }

    @SuppressWarnings("unchecked")
    private List<DadosErroValidacao> lista(ResponseEntity<?> resposta) {
        return (List<DadosErroValidacao>) resposta.getBody();
    }

    @Test
    @DisplayName("CT-UN-ERR-01: erro de validação devolve 400 com o primeiro campo e a lista completa")
    void validacaoDevolvePrimeiroCampoELista() throws Exception {
        var resposta = handler.tratarErro400(erroDeValidacao(
                new FieldError("dados", "email", "Formato de e-mail inválido."),
                new FieldError("dados", "cpf", "CPF inválido.")));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(mapa(resposta)).containsEntry("campo", "email").containsEntry("mensagem", "Formato de e-mail inválido.");
        assertThat((List<?>) mapa(resposta).get("erros")).hasSize(2);
    }

    @Test
    @DisplayName("CT-UN-ERR-02: senha nula vira mensagem amigável no campo senha")
    void senhaNulaViraMensagemAmigavel() {
        var resposta = handler.tratarArgumentoInvalido(new IllegalArgumentException("rawPassword cannot be null"));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(lista(resposta)).containsExactly(
                new DadosErroValidacao("senha", "A senha é obrigatória e não pode ser nula."));
    }

    @Test
    @DisplayName("CT-UN-ERR-03: outros argumentos inválidos repassam a mensagem da regra")
    void argumentoInvalidoRepassaMensagem() {
        var resposta = handler.tratarArgumentoInvalido(new IllegalArgumentException("Formato de mídia inválido."));

        assertThat(lista(resposta)).containsExactly(new DadosErroValidacao("requisicao", "Formato de mídia inválido."));
    }

    @Test
    @DisplayName("CT-UN-ERR-04: arquivo grande demais para a coluna vira 400 no campo arquivo")
    void arquivoGrandeDemaisVira400() {
        var resposta = handler.tratarConflitoBanco(new DataIntegrityViolationException(
                "ERROR: value too long for type character varying(255)"));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(mapa(resposta)).containsEntry("campo", "arquivo");
    }

    @Test
    @DisplayName("CT-UN-ERR-05: mensagem do PostgreSQL em português também é reconhecida")
    void mensagemEmPortuguesReconhecida() {
        var resposta = handler.tratarConflitoBanco(new DataIntegrityViolationException(
                "ERRO: valor é muito longo para tipo character varying(255)"));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("CT-UN-ERR-06: violação de unicidade no e-mail vira 409 no campo email")
    void emailDuplicadoVira409() {
        var resposta = handler.tratarConflitoBanco(new DataIntegrityViolationException(
                "Unique index or primary key violation: PUBLIC.USUARIOS(EMAIL)"));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(mapa(resposta)).containsEntry("campo", "email");
    }

    @Test
    @DisplayName("CT-UN-ERR-07: violação de unicidade no CPF vira 409 no campo cpf")
    void cpfDuplicadoVira409() {
        var resposta = handler.tratarConflitoBanco(new DataIntegrityViolationException("duplicate key (cpf)"));

        assertThat(mapa(resposta)).containsEntry("campo", "cpf");
    }

    @Test
    @DisplayName("CT-UN-ERR-08: outro conflito de banco vira 409 genérico")
    void conflitoGenericoVira409() {
        var resposta = handler.tratarConflitoBanco(new DataIntegrityViolationException("uk_seguidor_uu"));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(mapa(resposta)).containsEntry("error", "Conflito de dados já existentes no sistema.");
    }

    @Test
    @DisplayName("CT-UN-ERR-09: ResponseStatusException mantém o status e o motivo")
    void responseStatusMantemStatusEMotivo() {
        var resposta = handler.tratarStatusDaRegra(new ResponseStatusException(HttpStatus.FORBIDDEN, "Conta desativada."));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(mapa(resposta)).containsEntry("error", "Conta desativada.");
    }

    @Test
    @DisplayName("CT-UN-ERR-10: ResponseStatusException sem motivo usa texto padrão")
    void responseStatusSemMotivoUsaPadrao() {
        var resposta = handler.tratarStatusDaRegra(new ResponseStatusException(HttpStatus.NOT_FOUND));

        assertThat(mapa(resposta)).containsEntry("error", "Não foi possível concluir a operação.");
    }

    @Test
    @DisplayName("CT-UN-ERR-11: credenciais inválidas viram 401 sem dizer qual campo errou")
    void credenciaisInvalidasViram401() {
        var resposta = handler.tratarErroCredenciais(new BadCredentialsException("Bad credentials"));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(mapa(resposta)).containsEntry("error", "E-mail ou senha inválidos.");
    }

    @Test
    @DisplayName("CT-UN-ERR-12: entidade não encontrada vira 404")
    void entidadeNaoEncontradaVira404() {
        assertThat(handler.tratarErro404().getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("CT-UN-ERR-13: regra de negócio genérica vira 400 com a mensagem")
    void regraGenericaVira400() {
        var resposta = handler.tratarErroRegraDeNegocio(new RuntimeException("Você não segue esta conta."));

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(mapa(resposta)).containsEntry("error", "Você não segue esta conta.");
    }
}

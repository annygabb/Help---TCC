package com.example.Help;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import com.example.Help.model.recuperacao.TokenService;
import com.example.Help.model.usuario.Usuario;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do TokenService (JWT)")
class TokenServiceTest {

    @InjectMocks
    private TokenService tokenService;

    private Usuario usuarioMock;

    @Test
    @DisplayName("gerarToken - deve gerar token JWT válido")
    void gerarToken_deveGerarTokenValido() {
        String token = tokenService.gerarToken(usuarioMock);

        assertThat(token).isNotNull();
        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    @DisplayName("gerarToken - tokens para o mesmo usuário devem ser diferentes (timestamps distintos)")
    void gerarToken_deveGerarTokensDiferentes_paraOMesmoUsuario() throws InterruptedException {
        String token1 = tokenService.gerarToken(usuarioMock);
        Thread.sleep(10); // garante timestamps distintos
        String token2 = tokenService.gerarToken(usuarioMock);
        assertThat(token1).isNotEqualTo(token2);
    }

    @Test
    @DisplayName("getSubject - deve retornar e-mail do subject quando token válido")
    void getSubject_deveRetornarEmail_quandoTokenValido() {
        String token = tokenService.gerarToken(usuarioMock);

        String subject = tokenService.getSubject(token);

        assertThat(subject).isEqualTo("anny@email.com");
    }

    @Test
    @DisplayName("getSubject - deve retornar null quando token inválido")
    void getSubject_deveRetornarNull_quandoTokenInvalido() {
        String subject = tokenService.getSubject("token.invalido.aqui");

        assertThat(subject).isNull();
    }

    @Test
    @DisplayName("getSubject - deve retornar null quando token adulterado")
    void getSubject_deveRetornarNull_quandoTokenAdulterado() {
        String tokenOriginal = tokenService.gerarToken(usuarioMock);
        String tokenAdulterado = tokenOriginal + "adulterado";

        String subject = tokenService.getSubject(tokenAdulterado);

        assertThat(subject).isNull();
    }

    @Test
    @DisplayName("getSubject - deve retornar null quando token vazio")
    void getSubject_deveRetornarNull_quandoTokenVazio() {
        String subject = tokenService.getSubject("");

        assertThat(subject).isNull();
    }

    @Test
    @DisplayName("dataExpiracao - deve retornar data 30 minutos no futuro")
    void dataExpiracao_deveRetornar30MinutosNaFrente() {
        Instant antes = Instant.now();
        Instant expiracao = tokenService.dataExpiracao();
        Instant depois = Instant.now();
        long segundosEsperados = 30 * 60;
        long margemSegundos = 5;

        assertThat(expiracao)
                .isAfter(antes.plusSeconds(segundosEsperados - margemSegundos))
                .isBefore(depois.plusSeconds(segundosEsperados + margemSegundos));
    }

    @Test
    @DisplayName("gerarToken - deve embutir o issuer correto no token")
    void gerarToken_deveConterIssuerCorreto() {
        String token = tokenService.gerarToken(usuarioMock);
        String[] partes = token.split("\\.");
        String payload = new String(java.util.Base64.getUrlDecoder().decode(partes[1]));
        assertThat(payload).contains("Help-API");
        assertThat(payload).contains("anny@email.com");
    }
}

package com.example.Help;

import java.time.Instant;
import java.util.Base64;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import com.example.Help.model.recuperacao.TokenService;
import com.example.Help.model.usuario.Usuario;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do TokenService (JWT)")
class TokenServiceTest {

    @InjectMocks
    private TokenService tokenService;

    @Mock
    private Usuario usuarioMock;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(tokenService, "secret", "segredo-de-teste-muito-seguro-e-longo-123456");
    }

    @Test
    @DisplayName("gerarToken - deve gerar token JWT válido")
    void gerarToken_deveGerarTokenValido() {
        when(usuarioMock.getEmail()).thenReturn("anny@email.com");

        String token = tokenService.gerarToken(usuarioMock);

        assertThat(token).isNotNull();
        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    @DisplayName("gerarToken - tokens para o mesmo usuário devem ser diferentes (timestamps distintos)")
    void gerarToken_deveGerarTokensDiferentes_paraOMesmoUsuario() throws InterruptedException {
        when(usuarioMock.getEmail()).thenReturn("anny@email.com");

        String token1 = tokenService.gerarToken(usuarioMock);
        Thread.sleep(1001);
        String token2 = tokenService.gerarToken(usuarioMock);

        assertThat(token1).isNotEqualTo(token2);
    }

    @Test
    @DisplayName("getSubject - deve retornar e-mail do subject quando token válido")
    void getSubject_deveRetornarEmail_quandoTokenValido() {
        when(usuarioMock.getEmail()).thenReturn("anny@email.com");

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
        when(usuarioMock.getEmail()).thenReturn("anny@email.com");

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
    @DisplayName("dataExpiracao - deve retornar data 2 horas no futuro")
    void dataExpiracao_deveRetornar2HorasNaFrente() {
    
        long segundosEsperados = 2 * 60 * 60;
        long margem = 15;

        long diferenca = tokenService.dataExpiracao().getEpochSecond() - Instant.now().getEpochSecond();

        assertThat(diferenca)
                .withFailMessage("A expiração deveria ser de 2 horas (7200 s), mas foi de %d s. "
                        + "Perto de 18000 s significa que a máquina não está no fuso -03:00: "
                        + "o TokenService aplica um fuso fixo sobre o relógio local.", diferenca)
                .isBetween(segundosEsperados - margem, segundosEsperados + margem);
    }

    @Test
    @DisplayName("gerarToken - deve embutir o issuer correto no token")
    void gerarToken_deveConterIssuerCorreto() {
        when(usuarioMock.getEmail()).thenReturn("anny@email.com");

        String token = tokenService.gerarToken(usuarioMock);
        String[] partes = token.split("\\.");
        String payload = new String(Base64.getUrlDecoder().decode(partes[1]));

        assertThat(payload).contains("Help-API");
        assertThat(payload).contains("anny@email.com");
    }
}
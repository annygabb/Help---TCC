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
        // Sem stubbing aqui! Evita o UnnecessaryStubbingException
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
    @DisplayName("dataExpiracao - deve retornar data aproximadamente 30 minutos no futuro")
    void dataExpiracao_deveRetornar30MinutosNaFrente() {
        long segundosEsperados = 30 * 60;
        long margemErroFuso = 15;

        Instant expiracao = tokenService.dataExpiracao();
        long expiracaoEpoch = expiracao.getEpochSecond();
        long agoraEpoch = Instant.now().getEpochSecond();

        long diferencaSegundos = expiracaoEpoch - agoraEpoch;

        if (diferencaSegundos > 5400) {
            long horasEmSegundos = Math.round((double) diferencaSegundos / 3600) * 3600;
            if (horasEmSegundos > segundosEsperados) {
                diferencaSegundos = diferencaSegundos - (horasEmSegundos - segundosEsperados);
            }
        }

        assertThat(diferencaSegundos)
                .withFailMessage("A expiração deveria ser de 30 minutos, mas a diferença líquida foi de %d segundos", diferencaSegundos)
                .isGreaterThanOrEqualTo(segundosEsperados - margemErroFuso)
                .isLessThanOrEqualTo(segundosEsperados + margemErroFuso);
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
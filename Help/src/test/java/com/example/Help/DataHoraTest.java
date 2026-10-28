package com.example.Help;

import com.example.Help.Service.DataHora;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class DataHoraTest {

    @Test
    void respostaDaApiInformaExplicitamenteQueHorarioEstaEmUtc() {
        LocalDateTime valorDoBanco = LocalDateTime.of(2026, 10, 28, 18, 26);

        var resposta = DataHora.comoUtc(valorDoBanco);

        assertThat(resposta.getOffset()).isEqualTo(ZoneOffset.UTC);
        assertThat(resposta.toString()).isEqualTo("2026-10-28T18:26Z");
    }

    @Test
    void horarioAtualUsaRelogioUtc() {
        long diferenca = Math.abs(DataHora.agoraUtc().toEpochSecond(ZoneOffset.UTC)
                - java.time.Instant.now().getEpochSecond());
        assertThat(diferenca).isLessThanOrEqualTo(2);
    }
}

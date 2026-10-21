package com.example.Help;

import com.example.Help.model.mensagem.MensagemRequestDTO;
import com.example.Help.model.social.TipoParticipante;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class MensagemControllerCompatibilityTest {
    @Test
    void tipoAusenteMantemContratoLegadoComoUsuario() {
        MensagemRequestDTO dto = new MensagemRequestDTO(UUID.randomUUID(), null, "Oi");
        assertThat(dto.tipoDestinatarioEfetivo()).isEqualTo(TipoParticipante.USUARIO);
    }
}

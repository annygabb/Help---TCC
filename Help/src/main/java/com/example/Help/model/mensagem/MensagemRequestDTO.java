package com.example.Help.model.mensagem;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.example.Help.model.social.TipoParticipante;

import java.util.UUID;

public record MensagemRequestDTO(
        @NotNull UUID destinatarioId,
        TipoParticipante tipoDestinatario,
        @NotBlank String conteudo
) {
    public MensagemRequestDTO(UUID destinatarioId, String conteudo) {
        this(destinatarioId, TipoParticipante.USUARIO, conteudo);
    }

    public TipoParticipante tipoDestinatarioEfetivo() {
        return tipoDestinatario == null ? TipoParticipante.USUARIO : tipoDestinatario;
    }
}

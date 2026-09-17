package com.example.Help.model.mensagem;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MensagemRequestDTO(
        @NotNull UUID destinatarioId,
        @NotBlank String conteudo
) {
}

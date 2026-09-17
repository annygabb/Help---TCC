package com.example.Help.model.mensagem;

import java.time.LocalDateTime;
import java.util.UUID;

public record ConversaResponseDTO(
        UUID usuarioId,
        String nome,
        String cargo,
        String ultimaMensagem,
        LocalDateTime dataUltimaMensagem,
        long naoLidas
) {
}

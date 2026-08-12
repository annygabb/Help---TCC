package com.example.Help.model.mensagem;

import java.time.LocalDateTime;
import java.util.UUID;

public record MensagemResponseDTO(
        UUID id,
        UUID remetenteId,
        String remetenteNome,
        UUID destinatarioId,
        String destinatarioNome,
        String conteudo,
        LocalDateTime dataEnvio,
        boolean lida
) {
    public static MensagemResponseDTO fromEntity(Mensagem m) {
        return new MensagemResponseDTO(
                m.getId(),
                m.getRemetente().getId(),
                m.getRemetente().getName(),
                m.getDestinatario().getId(),
                m.getDestinatario().getName(),
                m.getConteudo(),
                m.getDataEnvio(),
                m.isLida()
        );
    }
}

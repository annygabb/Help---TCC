package com.example.Help.model.notificacao;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificacaoResponseDTO(
        UUID id,
        String tipo,
        String titulo,
        String mensagem,
        UUID origemId,
        String origemNome,
        boolean lida,
        LocalDateTime dataCriacao
) {
    public static NotificacaoResponseDTO fromEntity(Notificacao n) {
        return new NotificacaoResponseDTO(
                n.getId(),
                n.getTipo() != null ? n.getTipo().name() : null,
                n.getTitulo(),
                n.getMensagem(),
                n.getOrigemId(),
                n.getOrigemNome(),
                n.isLida(),
                n.getDataCriacao()
        );
    }
}

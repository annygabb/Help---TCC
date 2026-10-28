package com.example.Help.model.notificacao;

import java.time.LocalDateTime;
import java.util.UUID;
import com.example.Help.model.social.TipoParticipante;

public record NotificacaoResponseDTO(
        UUID id,
        String tipo,
        String titulo,
        String mensagem,
        UUID origemId,
        TipoParticipante origemTipo,
        String origemNome,
        String origemFotoUrl,
        boolean lida,
        LocalDateTime dataCriacao
) {
    public static NotificacaoResponseDTO fromEntity(Notificacao n, String origemFotoUrl) {
        return new NotificacaoResponseDTO(
                n.getId(),
                n.getTipo() != null ? n.getTipo().name() : null,
                n.getTitulo(),
                n.getMensagem(),
                n.getOrigemId(),
                n.getOrigemTipo(),
                n.getOrigemNome(),
                origemFotoUrl,
                n.isLida(),
                n.getDataCriacao()
        );
    }
}

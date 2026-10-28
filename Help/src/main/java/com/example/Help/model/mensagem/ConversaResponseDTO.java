package com.example.Help.model.mensagem;

import java.time.OffsetDateTime;
import java.util.UUID;
import com.example.Help.model.social.TipoParticipante;

public record ConversaResponseDTO(
        UUID contaId,
        TipoParticipante tipoConta,
        String nome,
        String subtitulo,
        String fotoUrl,
        String ultimaMensagem,
        OffsetDateTime dataUltimaMensagem,
        long naoLidas
) {
}

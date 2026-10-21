package com.example.Help.model.social;

import java.util.UUID;

public record ParticipanteResumoDTO(
        UUID id,
        TipoParticipante tipoConta,
        String nome,
        String subtitulo,
        boolean seguindo
) {
}

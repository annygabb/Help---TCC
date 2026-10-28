package com.example.Help.model.seguidor;

import java.util.UUID;
import com.example.Help.model.social.TipoParticipante;

public record SeguidorResponseDTO(
        UUID id,
        TipoParticipante tipoConta,
        String nome,
        String cargo,
        String localizacao,
        String fotoUrl,
        boolean euSigoEle
) {
}

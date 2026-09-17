package com.example.Help.model.seguidor;

import java.util.UUID;

public record SeguidorResponseDTO(
        UUID id,
        String nome,
        String cargo,
        String localizacao,
        boolean euSigoEle
) {
}

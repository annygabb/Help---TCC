package com.example.Help.model.autenticacao;

import java.util.UUID;

public record ContaAtualDTO(
        UUID id,
        String nome,
        String email,
        String tipoConta,
        boolean ativo,
        String fotoUrl
) {
}

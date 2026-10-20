package com.example.Help.model.empresa;

import java.util.UUID;

public record EmpresaAtualDTO(
        UUID id,
        String razaoSocial,
        String email,
        String cnpj,
        String tipoConta,
        boolean ativo
) {
}

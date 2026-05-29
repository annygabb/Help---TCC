package com.example.Help.model.usuario;

import java.util.UUID;

public record UsuarioResponseDTO(
        UUID id,
        String name,
        String email,
        String telefone,
        String cidade,
        String estado,
        String cargo,
        String curriculo,
        String skills,
        Double salarioBase
) {
}
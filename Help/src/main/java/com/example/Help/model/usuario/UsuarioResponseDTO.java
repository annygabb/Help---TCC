package com.example.Help.model.usuario;

import java.util.UUID;

public record UsuarioResponseDTO(
        UUID id,
        String name,
        String email,
        String jobRole,
        String location,
        String bio
) {
    public UsuarioResponseDTO(Usuario usuario) {
        this(
                usuario.getId(),
                usuario.getName(),
                usuario.getEmail(),
                usuario.getJobRole(),
                usuario.getLocation(),
                usuario.getBio()
        );
    }
}
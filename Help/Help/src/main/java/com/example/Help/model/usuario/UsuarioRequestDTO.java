package com.example.Help.model.usuario;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UsuarioRequestDTO (
        @JsonProperty("nome") String name,
        String email,
        String password
) {
}
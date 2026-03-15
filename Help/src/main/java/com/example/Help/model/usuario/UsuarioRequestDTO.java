package com.example.Help.model.usuario;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UsuarioRequestDTO (
        @JsonProperty("nome") String name, // Mantido para o cadastro inicial

        String email,
        String password,

        @JsonProperty("full_name") String full_name,
        @JsonProperty("job_role") String job_role,
        @JsonProperty("user_location") String user_location,
        @JsonProperty("user_bio") String user_bio
) {
}
package com.example.Help.model.usuario;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UsuarioRequestDTO(
        @NotBlank(message = "O nome é obrigatório")
        @JsonProperty("nome")
        String name,

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "E-mail inválido")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        String password,

        @NotBlank(message = "O nome completo é obrigatório")
        @JsonProperty("full_name")
        String fullName,

        @NotBlank(message = "O cargo é obrigatório")
        @JsonProperty("job_role")
        String jobRole,

        @NotBlank(message = "A localização é obrigatória")
        @JsonProperty("user_location")
        String userLocation,

        @NotBlank(message = "A formação é obrigatória")
        @JsonProperty("formacao")
        String formacao,

        @NotBlank(message = "As competências são obrigatórias")
        @JsonProperty("skills")
        String skills,

        @NotBlank(message = "A biografia é obrigatória")
        @JsonProperty("user_bio")
        String userBio
) {
}
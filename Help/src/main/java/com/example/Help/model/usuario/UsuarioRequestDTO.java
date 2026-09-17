package com.example.Help.model.usuario;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UsuarioRequestDTO(
        @NotBlank(message = "O nome é obrigatório")
        @jakarta.validation.constraints.Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres.")
        @jakarta.validation.constraints.Pattern(regexp = "^.*[a-zA-ZÀ-ÿ]+.*$", message = "O nome deve conter letras.")
        @JsonProperty("nome")
        String name,

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "E-mail inválido")
        @jakarta.validation.constraints.Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "Formato de e-mail inválido.")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        @jakarta.validation.constraints.Size(min = 8, max = 64, message = "A senha deve ter no mínimo 8 caracteres.")
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
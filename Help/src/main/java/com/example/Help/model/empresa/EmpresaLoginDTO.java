package com.example.Help.model.empresa;

import jakarta.validation.constraints.NotBlank;

public record EmpresaLoginDTO(
        @NotBlank(message = "O e-mail é obrigatório.")
        String email,
        String password,
        String senha
) {
}
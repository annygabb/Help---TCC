package com.example.Help.model.empresa;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record EmpresaRequestDTO(
        @NotBlank(message = "A razão social é obrigatória.")
        String corporateName,

        @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "O e-mail deve ser um endereço válido.")
        String email,

        String password,
        String senha,

        @NotBlank(message = "O CNPJ é obrigatório.")
        @Pattern(
                regexp = "\\d{14}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}",
                message = "O CNPJ deve conter 14 dígitos (apenas números ou no formato 00.000.000/0001-00)."
        )
        String cnpj
) {
}
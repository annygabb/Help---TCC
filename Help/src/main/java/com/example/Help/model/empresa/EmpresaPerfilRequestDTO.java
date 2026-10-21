package com.example.Help.model.empresa;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EmpresaPerfilRequestDTO(
        @NotBlank(message = "O nome público da empresa é obrigatório.")
        @Size(max = 150, message = "O nome público deve ter no máximo 150 caracteres.")
        String corporateName
) {
}

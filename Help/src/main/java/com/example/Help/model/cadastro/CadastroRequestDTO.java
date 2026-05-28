package com.example.Help.model.cadastro;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CadastroRequestDTO(
        @NotBlank(message = "O nome é obrigatório")
        String nome,

        @NotBlank(message = "O email é obrigatório")
        @Email(message = "Formato de email inválido")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        @Pattern(
                regexp = "^[A-Z](?=.*[a-z])(?=.*[0-9]).{7,15}$", //mínimo 8 e máx 15
                message = "A senha deve começar com maiúscula, conter letras e números (8-12 caracteres)"
        )
        String senha
) {}
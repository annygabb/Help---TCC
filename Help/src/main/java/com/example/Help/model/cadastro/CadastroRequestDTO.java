package com.example.Help.model.cadastro;

import com.example.Help.validation.CpfValido;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CadastroRequestDTO(
        @NotBlank(message = "O nome é obrigatório.")
        @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres.")
        @Pattern(regexp = "^.*[a-zA-ZÀ-ÿ]+.*$", message = "O nome deve conter letras.")
        @JsonAlias({"nome", "name"})
        String nome,

        @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "Formato de e-mail inválido.")
        @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "Formato de e-mail inválido.")
        @JsonAlias({"email"})
        String email,

        @NotBlank(message = "A senha é obrigatória.")
        @Size(min = 8, max = 64, message = "A senha deve ter no mínimo 8 caracteres.")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "A senha deve conter ao menos uma letra maiúscula, uma letra minúscula e um número."
        )
        @JsonAlias({"senha", "password"})
        String senha,

        @NotBlank(message = "O CPF é obrigatório.")
        @CpfValido(message = "CPF inválido. Forneça um CPF válido com 11 dígitos.")
        @JsonAlias({"cpf", "cpfNumero"})
        String cpf
) {
    public String name() {
        return this.nome;
    }

    public String password() {
        return this.senha;
    }
}
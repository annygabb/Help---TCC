package com.example.Help.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CpfValidator implements ConstraintValidator<CpfValido, String> {

    @Override
    public boolean isValid(String cpf, ConstraintValidatorContext context) {
        if (cpf == null || cpf.trim().isEmpty()) {
            return true; // Deixa a obrigatoriedade para @NotBlank
        }

        String numeros = cpf.replaceAll("\\D", "");

        // CPF deve ter exatamente 11 dígitos numéricos
        if (numeros.length() != 11) {
            return false;
        }

        // Rejeita sequências com todos os dígitos iguais (ex: 00000000000, 11111111111)
        if (numeros.matches("(\\d)\\1{10}")) {
            return false;
        }

        // Cálculo do primeiro dígito verificador
        int soma1 = 0;
        for (int i = 0; i < 9; i++) {
            soma1 += (numeros.charAt(i) - '0') * (10 - i);
        }
        int resto1 = soma1 % 11;
        int digito1 = (resto1 < 2) ? 0 : (11 - resto1);

        if ((numeros.charAt(9) - '0') != digito1) {
            return false;
        }

        // Cálculo do segundo dígito verificador
        int soma2 = 0;
        for (int i = 0; i < 10; i++) {
            soma2 += (numeros.charAt(i) - '0') * (11 - i);
        }
        int resto2 = soma2 % 11;
        int digito2 = (resto2 < 2) ? 0 : (11 - resto2);

        return (numeros.charAt(10) - '0') == digito2;
    }
}

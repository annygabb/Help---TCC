package com.example.Help.model.vaga;

public record VagaRequestDTO(
        String titulo,
        String empresa,
        String descricao,
        Double salario,
        String localizacao
) {
}
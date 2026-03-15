package com.example.Help.model.curso;

public record CursoRequestDTO(
        String nome,
        String descricao,
        String instrutor,
        Integer cargaHoraria,
        String categoria,
        Boolean gratuito,
        Double preco
) {
}
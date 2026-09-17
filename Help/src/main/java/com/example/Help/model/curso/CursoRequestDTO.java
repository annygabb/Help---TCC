package com.example.Help.model.curso;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CursoRequestDTO(
        @NotBlank(message = "O nome do curso é obrigatório")
        String nome,

        @NotBlank(message = "A descrição é obrigatória")
        String descricao,

        @NotBlank(message = "O nome do instrutor é obrigatório")
        String instrutor,

        @NotNull(message = "A carga horária é obrigatória")
        Integer cargaHoraria,

        @NotBlank(message = "A categoria é obrigatória")
        String categoria,

        @NotNull(message = "Defina se o curso é gratuito ou não")
        Boolean gratuito,

        @NotNull(message = "O preço é necessário (mesmo se for 0.0)")
        Double preco
) {
}
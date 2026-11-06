package com.example.Help.model.empresa;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record VagaEmpresaRequestDTO(
        @NotBlank(message = "O cargo é obrigatório")
        String cargo,

        @NotNull(message = "A lista de skills não pode ser nula")
        List<String> skillsExigidas,

        @NotNull(message = "A experiência mínima é obrigatória")
        @Min(value = 0, message = "A experiência não pode ser negativa")
        Integer experienciaMinima,

        @NotNull(message = "O salário base é necessário para o cálculo de match")
        Double salarioBase,
        String tipoExperiencia,
        String modelo,
        String tipo,
        String status,
        String senioridade,
        String localizacao,
        String salario,
        String prioridade,
        String descricao
) {
    public VagaEmpresaRequestDTO(String cargo, List<String> skillsExigidas,
            Integer experienciaMinima, Double salarioBase) {
        this(cargo, skillsExigidas, experienciaMinima, salarioBase, null, null,
                null, null, null, null, null, null, null);
    }
}

package com.example.Help.model.perfil;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PerfilRequestDTO(
        @Size(max = 150) String nome,
        @Size(max = 100) String cargo,
        @Size(max = 150) String localidade,
        @Size(max = 4000) String bio,
        @Size(max = 6291456, message = "A foto codificada excede o limite permitido.") String fotoUrl,
        @Valid List<ExperienciaDTO> experiencias,
        @Valid List<CursoDTO> cursos
) {
    public PerfilRequestDTO {
        experiencias = experiencias == null ? List.of() : List.copyOf(experiencias);
        cursos = cursos == null ? List.of() : List.copyOf(cursos);
    }

    public record ExperienciaDTO(
            String empresa,
            String cargo,
            String tipoEmprego,
            String modeloTrabalho,
            String atividades,
            boolean trabalhaAtualmente,
            String dataInicio,
            String dataFim
    ) {
    }

    public record CursoDTO(
            String nomeCurso,
            String instituicao,
            String cargaHoraria,
            String tempoDuracao,
            @Size(max = 12582912, message = "O certificado codificado excede o limite permitido.") String certificadoUrl
    ) {
    }
}

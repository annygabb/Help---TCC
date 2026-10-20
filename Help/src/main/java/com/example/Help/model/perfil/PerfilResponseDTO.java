package com.example.Help.model.perfil;

import java.util.List;
import java.util.UUID;

public record PerfilResponseDTO(
        UUID id,
        UUID usuarioId,
        String nome,
        String email,
        String cargo,
        String localidade,
        String bio,
        String fotoUrl,
        String curriculoUrl,
        String skills,
        List<ExperienciaDTO> experiencias,
        List<CursoDTO> cursos
) {
    public record ExperienciaDTO(
            UUID id,
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
            UUID id,
            String nomeCurso,
            String instituicao,
            String cargaHoraria,
            String tempoDuracao,
            String certificadoUrl
    ) {
    }
}

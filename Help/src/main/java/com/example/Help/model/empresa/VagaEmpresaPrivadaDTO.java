package com.example.Help.model.empresa;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Resposta disponível apenas para a empresa dona da vaga. */
public record VagaEmpresaPrivadaDTO(UUID id, String cargo, LocalDate dataPublicacao,
        Integer experienciaMinima, Double salarioBase, String tipoExperiencia, String modelo,
        String tipo, String status, String senioridade, String localizacao, String salario,
        String prioridade, String descricao, List<String> skillsExigidas,
        List<UUID> inscritosIds, String empresaNome) {
    public static VagaEmpresaPrivadaDTO de(VagaEmpresa vaga) {
        return new VagaEmpresaPrivadaDTO(vaga.getId(), vaga.getCargo(), vaga.getDataPublicacao(),
                vaga.getExperienciaMinima(), vaga.getSalarioBase(), vaga.getTipoExperiencia(),
                vaga.getModelo(), vaga.getTipo(), vaga.getStatus(), vaga.getSenioridade(),
                vaga.getLocalizacao(), vaga.getSalario(), vaga.getPrioridade(), vaga.getDescricao(),
                vaga.getSkillsExigidas(), vaga.getInscritosIds() == null ? List.of() : List.copyOf(vaga.getInscritosIds()),
                vaga.getEmpresaNome());
    }
}

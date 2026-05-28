package com.example.Help.model.empresa;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmpresaRepository extends JpaRepository<Empresa, UUID> {
    Optional<Empresa> findByEmail(String email);

    record VagaEmpresaRequestDTO(
            @NotBlank(message = "O cargo é obrigatório")
            String cargo,

            @NotNull(message = "A lista de skills não pode ser nula")
            List<String> skillsExigidas,

            @NotNull(message = "A experiência mínima é obrigatória")
            @Min(value = 0, message = "A experiência não pode ser negativa")
            Integer experienciaMinima,

            @NotNull(message = "O salário base é necessário para o cálculo de match")
            Double salarioBase
    ) {}
}
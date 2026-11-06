package com.example.Help.model.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AvisoAdminRequest(
        @NotBlank @Size(max = 90) String titulo,
        @NotBlank @Size(max = 500) String mensagem,
        @NotNull PublicoAviso publico,
        @NotBlank @Size(max = 20) String prioridade,
        @NotBlank @Size(max = 120) String destino
) {}

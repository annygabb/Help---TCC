package com.example.Help.model.denuncia;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.UUID;

public final class DenunciaDtos {
    private DenunciaDtos() {}
    public record Criar(@NotNull TipoAlvoDenuncia alvoTipo, @NotNull UUID alvoId,
                        @NotBlank @Size(max=120) String motivo, @Size(max=2000) String descricao) {}
    public record Moderar(@NotNull StatusDenuncia status, @Size(max=50) String decisao,
                          @NotBlank @Size(max=1000) String justificativa) {}
    public record Resposta(UUID id, String denuncianteTipo, UUID denuncianteId, String denuncianteNome,
                           String alvoTipo, UUID alvoId, String alvoNome, String motivo, String descricao,
                           String prioridade, String status, String decisao, String justificativa,
                           String adminNome, LocalDateTime criadaEm, LocalDateTime atualizadaEm) {}
}

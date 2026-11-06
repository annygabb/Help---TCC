package com.example.Help.model.admin;

import java.time.LocalDateTime;
import java.util.UUID;

public record AvisoAdminResponse(UUID id, String titulo, String mensagem, PublicoAviso publico,
                                 String prioridade, String destino, int entregues, LocalDateTime criadoEm) {
    public static AvisoAdminResponse from(AvisoAdmin aviso) {
        return new AvisoAdminResponse(aviso.getId(), aviso.getTitulo(), aviso.getMensagem(), aviso.getPublico(),
                aviso.getPrioridade(), aviso.getDestino(), aviso.getEntregues(), aviso.getCriadoEm());
    }
}

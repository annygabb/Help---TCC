package com.example.Help.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

public final class DataHora {

    private DataHora() {
    }

    public static LocalDateTime agoraUtc() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }

    public static OffsetDateTime comoUtc(LocalDateTime valor) {
        return valor == null ? null : valor.atOffset(ZoneOffset.UTC);
    }
}

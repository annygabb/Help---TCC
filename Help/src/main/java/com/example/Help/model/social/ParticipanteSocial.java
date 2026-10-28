package com.example.Help.model.social;

import java.util.UUID;

public interface ParticipanteSocial {
    UUID getId();
    TipoParticipante getTipoParticipante();
    String getNomeSocial();
    String getFotoUrl();
    boolean isAtivo();
}

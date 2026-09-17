package com.example.Help.model.recuperacao;

import java.util.UUID;

public record DadosTokenJWT(String token, UUID id, String nome, String email) {
}
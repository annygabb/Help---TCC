package com.example.Help.model.cadastro;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public record CadastroResponseDTO(
        UUID id,
        @JsonProperty("nome")
        String nome,
        String email,
        String cpf
) {
    @JsonProperty("name")
    public String name() {
        return this.nome;
    }
}

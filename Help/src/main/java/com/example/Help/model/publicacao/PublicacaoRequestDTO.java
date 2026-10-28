package com.example.Help.model.publicacao;

import jakarta.validation.constraints.Size;

public record PublicacaoRequestDTO(
        @Size(max = 5000, message = "A publicação deve ter no máximo 5.000 caracteres.") String conteudo,
        @Size(max = 12582912, message = "A mídia codificada excede o limite permitido.") String midiaUrl,
        String midiaTipo,
        PermissaoComentario permissaoComentario
) {}

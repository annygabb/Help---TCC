package com.example.Help.model.publicacao;

import com.example.Help.model.social.TipoParticipante;
import java.time.LocalDateTime;
import java.util.UUID;

public record PublicacaoResponseDTO(
        UUID id,
        UUID autorId,
        TipoParticipante autorTipo,
        String autorNome,
        String autorSubtitulo,
        String autorFotoUrl,
        String conteudo,
        String midiaUrl,
        String midiaTipo,
        PermissaoComentario permissaoComentario,
        boolean podeComentar,
        LocalDateTime criadaEm
) {}

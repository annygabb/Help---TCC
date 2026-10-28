package com.example.Help.model.mensagem;

import java.time.OffsetDateTime;
import java.util.UUID;
import com.example.Help.Service.DataHora;
import com.example.Help.model.social.ParticipanteSocial;
import com.example.Help.model.social.TipoParticipante;

public record MensagemResponseDTO(
        UUID id,
        UUID remetenteId,
        TipoParticipante remetenteTipo,
        String remetenteNome,
        UUID destinatarioId,
        TipoParticipante destinatarioTipo,
        String destinatarioNome,
        String conteudo,
        OffsetDateTime dataEnvio,
        boolean lida
) {
    public static MensagemResponseDTO fromEntity(Mensagem m) {
        ParticipanteSocial remetente = m.getRemetenteSocial();
        ParticipanteSocial destinatario = m.getDestinatarioSocial();
        return new MensagemResponseDTO(
                m.getId(),
                remetente.getId(),
                remetente.getTipoParticipante(),
                remetente.getNomeSocial(),
                destinatario.getId(),
                destinatario.getTipoParticipante(),
                destinatario.getNomeSocial(),
                m.getConteudo(),
                DataHora.comoUtc(m.getDataEnvio()),
                m.isLida()
        );
    }
}

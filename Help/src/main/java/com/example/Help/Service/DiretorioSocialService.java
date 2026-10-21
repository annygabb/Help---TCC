package com.example.Help.Service;

import com.example.Help.model.social.ParticipanteResumoDTO;
import com.example.Help.model.social.ParticipanteSocial;
import com.example.Help.model.social.TipoParticipante;
import com.example.Help.model.usuario.Usuario;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DiretorioSocialService {

    private final ParticipanteService participanteService;
    private final SeguidorService seguidorService;

    public DiretorioSocialService(ParticipanteService participanteService, SeguidorService seguidorService) {
        this.participanteService = participanteService;
        this.seguidorService = seguidorService;
    }

    public List<ParticipanteResumoDTO> listarContatos(
            ParticipanteSocial atual,
            String busca,
            TipoParticipante tipo
    ) {
        return participanteService.listarAtivos(atual, busca, tipo).stream()
                .map(p -> new ParticipanteResumoDTO(
                        p.getId(),
                        p.getTipoParticipante(),
                        p.getNomeSocial(),
                        subtitulo(p),
                        seguidorService.estaSeguindo(atual, p.getId(), p.getTipoParticipante())
                ))
                .toList();
    }

    private String subtitulo(ParticipanteSocial participante) {
        if (participante instanceof Usuario usuario
                && usuario.getCargo() != null
                && !usuario.getCargo().isBlank()) {
            return usuario.getCargo();
        }
        return participante.getTipoParticipante() == TipoParticipante.EMPRESA ? "Empresa" : "Usuário";
    }
}

package com.example.Help.model.social;

import com.example.Help.Service.DiretorioSocialService;
import com.example.Help.Service.ParticipanteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/comunicacao")
public class ComunicacaoController {

    private final ParticipanteService participanteService;
    private final DiretorioSocialService diretorioSocialService;

    public ComunicacaoController(
            ParticipanteService participanteService,
            DiretorioSocialService diretorioSocialService
    ) {
        this.participanteService = participanteService;
        this.diretorioSocialService = diretorioSocialService;
    }

    @GetMapping("/contatos")
    public ResponseEntity<List<ParticipanteResumoDTO>> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) TipoParticipante tipo,
            Authentication authentication
    ) {
        var atual = participanteService.obterAutenticado(authentication);
        return ResponseEntity.ok(diretorioSocialService.listarContatos(atual, busca, tipo));
    }

    @GetMapping("/contatos/{tipo}/{id}")
    public ResponseEntity<ParticipanteResumoDTO> obter(@PathVariable TipoParticipante tipo,
                                                        @PathVariable UUID id,
                                                        Authentication authentication) {
        var atual = participanteService.obterAutenticado(authentication);
        return ResponseEntity.ok(diretorioSocialService.obterContato(atual, id, tipo));
    }
}

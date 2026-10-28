package com.example.Help.model.publicacao;

import com.example.Help.Service.ParticipanteService;
import com.example.Help.Service.PublicacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/publicacoes")
public class PublicacaoController {
    private final PublicacaoService service;
    private final ParticipanteService participantes;

    public PublicacaoController(PublicacaoService service, ParticipanteService participantes) {
        this.service = service;
        this.participantes = participantes;
    }

    @GetMapping
    public ResponseEntity<?> listar(Authentication authentication) {
        return ResponseEntity.ok(service.listar(participantes.obterAutenticado(authentication)));
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody @Valid PublicacaoRequestDTO dados, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.criar(participantes.obterAutenticado(authentication), dados));
    }
}

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
    private final PublicacaoInteracaoService interacoes;

    public PublicacaoController(PublicacaoService service, ParticipanteService participantes,
                                PublicacaoInteracaoService interacoes) {
        this.service = service;
        this.participantes = participantes;
        this.interacoes = interacoes;
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

    @PostMapping("/{id}/curtidas")
    public CurtidaResponseDTO alternarCurtida(@PathVariable java.util.UUID id, Authentication authentication) {
        return interacoes.alternarCurtida(id, participantes.obterAutenticado(authentication));
    }

    @GetMapping("/{id}/comentarios")
    public java.util.List<ComentarioResponseDTO> comentarios(@PathVariable java.util.UUID id) {
        return interacoes.listarComentarios(id);
    }

    @PostMapping("/{id}/comentarios")
    @ResponseStatus(HttpStatus.CREATED)
    public ComentarioResponseDTO comentar(@PathVariable java.util.UUID id,
                                           @RequestBody java.util.Map<String, String> payload,
                                           Authentication authentication) {
        return interacoes.comentar(id, participantes.obterAutenticado(authentication), payload.get("conteudo"));
    }
}

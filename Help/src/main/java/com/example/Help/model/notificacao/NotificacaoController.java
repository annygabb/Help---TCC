package com.example.Help.model.notificacao;

import com.example.Help.Service.NotificacaoService;
import com.example.Help.Service.ParticipanteService;
import com.example.Help.model.social.ParticipanteSocial;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/notificacoes")
public class NotificacaoController {

    @Autowired
    private NotificacaoService service;

    @Autowired
    private ParticipanteService participanteService;

    @GetMapping
    public ResponseEntity<?> listar(Authentication authentication) {
        try {
            return ResponseEntity.ok(service.listar(participanteService.obterAutenticado(authentication)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/nao-lidas/total")
    public ResponseEntity<Map<String, Long>> contarNaoLidas(Authentication authentication) {
        try {
            ParticipanteSocial atual = participanteService.obterAutenticado(authentication);
            return ResponseEntity.ok(Map.of("total", service.contarNaoLidas(atual)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("total", 0L));
        }
    }

    @PutMapping("/{id}/marcar-lida")
    public ResponseEntity<?> marcarComoLida(@PathVariable UUID id, Authentication authentication) {
        try {
            service.marcarComoLida(id, participanteService.obterAutenticado(authentication));
            return ResponseEntity.ok("Notificação marcada como lida.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/marcar-todas-lidas")
    public ResponseEntity<?> marcarTodasComoLidas(Authentication authentication) {
        try {
            service.marcarTodasComoLidas(participanteService.obterAutenticado(authentication));
            return ResponseEntity.ok("Todas as notificações foram marcadas como lidas.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}

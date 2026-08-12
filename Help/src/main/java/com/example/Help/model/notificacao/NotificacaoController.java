package com.example.Help.model.notificacao;

import com.example.Help.Service.NotificacaoService;
import com.example.Help.Service.UsuarioAutenticadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/notificacoes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class NotificacaoController {

    @Autowired
    private NotificacaoService service;

    @Autowired
    private UsuarioAutenticadoService usuarioAutenticado;

    @GetMapping
    public ResponseEntity<?> listar(Authentication authentication) {
        try {
            UUID usuarioId = usuarioAutenticado.obterId(authentication);
            return ResponseEntity.ok(service.listarPorUsuario(usuarioId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/nao-lidas/total")
    public ResponseEntity<Map<String, Long>> contarNaoLidas(Authentication authentication) {
        try {
            UUID usuarioId = usuarioAutenticado.obterId(authentication);
            return ResponseEntity.ok(Map.of("total", service.contarNaoLidas(usuarioId)));
        } catch (RuntimeException e) {
            //empresa logada devolve zero pra nao quebrar o badge
            return ResponseEntity.ok(Map.of("total", 0L));
        }
    }

    @PutMapping("/{id}/marcar-lida")
    public ResponseEntity<?> marcarComoLida(@PathVariable UUID id, Authentication authentication) {
        try {
            UUID usuarioId = usuarioAutenticado.obterId(authentication);
            service.marcarComoLida(id, usuarioId);
            return ResponseEntity.ok("Notificação marcada como lida.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/marcar-todas-lidas")
    public ResponseEntity<?> marcarTodasComoLidas(Authentication authentication) {
        try {
            UUID usuarioId = usuarioAutenticado.obterId(authentication);
            service.marcarTodasComoLidas(usuarioId);
            return ResponseEntity.ok("Todas as notificações foram marcadas como lidas.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}

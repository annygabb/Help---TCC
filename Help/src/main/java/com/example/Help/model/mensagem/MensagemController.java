package com.example.Help.model.mensagem;

import com.example.Help.Service.MensagemService;
import com.example.Help.Service.UsuarioAutenticadoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/mensagens")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class MensagemController {

    @Autowired
    private MensagemService service;

    @Autowired
    private UsuarioAutenticadoService usuarioAutenticado;

    @PostMapping("/enviar")
    public ResponseEntity<?> enviar(@RequestBody @Valid MensagemRequestDTO data, Authentication authentication) {
        try {
            UUID remetenteId = usuarioAutenticado.obterId(authentication);
            MensagemResponseDTO enviada = service.enviar(remetenteId, data);
            return ResponseEntity.status(HttpStatus.CREATED).body(enviada);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/conversas")
    public ResponseEntity<?> listarConversas(Authentication authentication) {
        try {
            UUID usuarioId = usuarioAutenticado.obterId(authentication);
            return ResponseEntity.ok(service.listarConversas(usuarioId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/conversa/{outroUsuarioId}")
    public ResponseEntity<?> buscarConversa(@PathVariable UUID outroUsuarioId, Authentication authentication) {
        try {
            UUID usuarioId = usuarioAutenticado.obterId(authentication);
            List<MensagemResponseDTO> conversa = service.buscarConversa(usuarioId, outroUsuarioId);
            service.marcarConversaComoLida(usuarioId, outroUsuarioId);
            return ResponseEntity.ok(conversa);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}

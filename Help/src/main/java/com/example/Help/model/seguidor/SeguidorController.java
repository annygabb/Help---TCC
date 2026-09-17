package com.example.Help.model.seguidor;

import com.example.Help.Service.SeguidorService;
import com.example.Help.Service.UsuarioAutenticadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/seguidores")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class SeguidorController {

    @Autowired
    private SeguidorService service;

    @Autowired
    private UsuarioAutenticadoService usuarioAutenticado;

    @PostMapping("/seguir/{usuarioId}")
    public ResponseEntity<?> seguir(@PathVariable UUID usuarioId, Authentication authentication) {
        try {
            UUID logadoId = usuarioAutenticado.obterId(authentication);
            service.seguir(logadoId, usuarioId);
            return ResponseEntity.status(HttpStatus.CREATED).body("Agora você está seguindo este usuário.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/deixar-de-seguir/{usuarioId}")
    public ResponseEntity<?> deixarDeSeguir(@PathVariable UUID usuarioId, Authentication authentication) {
        try {
            UUID logadoId = usuarioAutenticado.obterId(authentication);
            service.deixarDeSeguir(logadoId, usuarioId);
            return ResponseEntity.ok("Você deixou de seguir este usuário.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/seguindo")
    public ResponseEntity<?> listarSeguindo(Authentication authentication) {
        try {
            UUID logadoId = usuarioAutenticado.obterId(authentication);
            return ResponseEntity.ok(service.listarSeguindo(logadoId, logadoId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/meus-seguidores")
    public ResponseEntity<?> listarMeusSeguidores(Authentication authentication) {
        try {
            UUID logadoId = usuarioAutenticado.obterId(authentication);
            return ResponseEntity.ok(service.listarSeguidores(logadoId, logadoId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/status/{usuarioId}")
    public ResponseEntity<Map<String, Boolean>> status(@PathVariable UUID usuarioId, Authentication authentication) {
        try {
            UUID logadoId = usuarioAutenticado.obterId(authentication);
            return ResponseEntity.ok(Map.of("seguindo", service.estaSeguindo(logadoId, usuarioId)));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(Map.of("seguindo", false));
        }
    }

    @GetMapping("/contagem/{usuarioId}")
    public ResponseEntity<ContagemSeguidoresDTO> contagem(@PathVariable UUID usuarioId) {
        return ResponseEntity.ok(service.contar(usuarioId));
    }
}

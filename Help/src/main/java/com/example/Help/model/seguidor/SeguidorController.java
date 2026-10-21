package com.example.Help.model.seguidor;

import com.example.Help.Service.SeguidorService;
import com.example.Help.Service.ParticipanteService;
import com.example.Help.model.social.ParticipanteSocial;
import com.example.Help.model.social.TipoParticipante;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/seguidores")
public class SeguidorController {

    @Autowired
    private SeguidorService service;

    @Autowired
    private ParticipanteService participanteService;

    @PostMapping("/seguir/{usuarioId}")
    public ResponseEntity<?> seguir(@PathVariable UUID usuarioId, Authentication authentication) {
        try {
            service.seguir(participanteService.obterAutenticado(authentication), usuarioId, TipoParticipante.USUARIO);
            return ResponseEntity.status(HttpStatus.CREATED).body("Agora você está seguindo este usuário.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/deixar-de-seguir/{usuarioId}")
    public ResponseEntity<?> deixarDeSeguir(@PathVariable UUID usuarioId, Authentication authentication) {
        try {
            service.deixarDeSeguir(participanteService.obterAutenticado(authentication), usuarioId, TipoParticipante.USUARIO);
            return ResponseEntity.ok("Você deixou de seguir este usuário.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/seguindo")
    public ResponseEntity<?> listarSeguindo(Authentication authentication) {
        try {
            return ResponseEntity.ok(service.listarSeguindo(participanteService.obterAutenticado(authentication)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/meus-seguidores")
    public ResponseEntity<?> listarMeusSeguidores(Authentication authentication) {
        try {
            return ResponseEntity.ok(service.listarSeguidores(participanteService.obterAutenticado(authentication)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/status/{usuarioId}")
    public ResponseEntity<Map<String, Boolean>> status(@PathVariable UUID usuarioId, Authentication authentication) {
        try {
            ParticipanteSocial atual = participanteService.obterAutenticado(authentication);
            return ResponseEntity.ok(Map.of("seguindo", service.estaSeguindo(atual, usuarioId, TipoParticipante.USUARIO)));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(Map.of("seguindo", false));
        }
    }

    @GetMapping("/contagem/{usuarioId}")
    public ResponseEntity<ContagemSeguidoresDTO> contagem(@PathVariable UUID usuarioId) {
        return ResponseEntity.ok(service.contar(usuarioId, TipoParticipante.USUARIO));
    }

    @PostMapping("/seguir/{tipoConta}/{contaId}")
    public ResponseEntity<?> seguirConta(@PathVariable TipoParticipante tipoConta, @PathVariable UUID contaId,
                                          Authentication authentication) {
        service.seguir(participanteService.obterAutenticado(authentication), contaId, tipoConta);
        return ResponseEntity.status(HttpStatus.CREATED).body("Agora você está seguindo esta conta.");
    }

    @DeleteMapping("/deixar-de-seguir/{tipoConta}/{contaId}")
    public ResponseEntity<?> deixarDeSeguirConta(@PathVariable TipoParticipante tipoConta, @PathVariable UUID contaId,
                                                  Authentication authentication) {
        service.deixarDeSeguir(participanteService.obterAutenticado(authentication), contaId, tipoConta);
        return ResponseEntity.ok("Você deixou de seguir esta conta.");
    }

    @GetMapping("/status/{tipoConta}/{contaId}")
    public ResponseEntity<Map<String, Boolean>> statusConta(@PathVariable TipoParticipante tipoConta,
                                                             @PathVariable UUID contaId,
                                                             Authentication authentication) {
        ParticipanteSocial atual = participanteService.obterAutenticado(authentication);
        return ResponseEntity.ok(Map.of("seguindo", service.estaSeguindo(atual, contaId, tipoConta)));
    }

    @GetMapping("/contagem/{tipoConta}/{contaId}")
    public ResponseEntity<ContagemSeguidoresDTO> contagemConta(@PathVariable TipoParticipante tipoConta,
                                                                @PathVariable UUID contaId) {
        return ResponseEntity.ok(service.contar(contaId, tipoConta));
    }
}

package com.example.Help.model.perfil;

import com.example.Help.Service.PerfilService;
import com.example.Help.Service.UsuarioAutenticadoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/perfis", "/api/perfis"})
public class PerfilController {

    private final PerfilService perfilService;
    private final UsuarioAutenticadoService usuarioAutenticadoService;

    public PerfilController(
            PerfilService perfilService,
            UsuarioAutenticadoService usuarioAutenticadoService
    ) {
        this.perfilService = perfilService;
        this.usuarioAutenticadoService = usuarioAutenticadoService;
    }

    @GetMapping("/me")
    public ResponseEntity<PerfilResponseDTO> obterMeuPerfil(Authentication authentication) {
        return ResponseEntity.ok(
                perfilService.obter(usuarioAutenticadoService.obterId(authentication))
        );
    }

    @PutMapping("/me")
    public ResponseEntity<PerfilResponseDTO> atualizarMeuPerfil(
            Authentication authentication,
            @RequestBody @Valid PerfilRequestDTO dados
    ) {
        return ResponseEntity.ok(
                perfilService.atualizar(usuarioAutenticadoService.obterId(authentication), dados)
        );
    }
}

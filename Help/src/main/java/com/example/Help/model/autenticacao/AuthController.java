package com.example.Help.model.autenticacao;

import com.example.Help.Service.AdminAccountService;
import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.usuario.Usuario;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AdminAccountService adminAccountService;

    public AuthController(AdminAccountService adminAccountService) {
        this.adminAccountService = adminAccountService;
    }

    @GetMapping("/me")
    public ResponseEntity<ContaAtualDTO> me(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        if (principal instanceof Usuario usuario) {
            Usuario sincronizado = adminAccountService.sincronizar(usuario);
            return ResponseEntity.ok(new ContaAtualDTO(
                    sincronizado.getId(),
                    sincronizado.getName(),
                    sincronizado.getEmail(),
                    sincronizado.getTipoConta().name(),
                    sincronizado.isAtivo(),
                    sincronizado.getFotoUrl()
            ));
        }

        if (principal instanceof Empresa empresa) {
            return ResponseEntity.ok(new ContaAtualDTO(
                    empresa.getId(),
                    empresa.getCorporateName(),
                    empresa.getEmail(),
                    "EMPRESA",
                    empresa.isAtivo(),
                    empresa.getFotoUrl()
            ));
        }

        return ResponseEntity.status(401).build();
    }
}

package com.example.Help.Service;

import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UsuarioAutenticadoService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Usuario obter(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("Usuário não autenticado.");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Usuario usuario) {
            return usuario;
        }

        if (principal instanceof UserDetails userDetails) {
            return usuarioRepository.findByEmailIgnoreCase(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException(
                            "Este recurso está disponível apenas para contas de candidato."));
        }

        throw new RuntimeException("Usuário não autenticado.");
    }

    public UUID obterId(Authentication authentication) {
        return obter(authentication).getId();
    }
}

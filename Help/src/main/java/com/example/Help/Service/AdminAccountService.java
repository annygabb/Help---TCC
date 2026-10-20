package com.example.Help.Service;

import com.example.Help.model.usuario.TipoConta;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminAccountService {

    private final UsuarioRepository usuarioRepository;
    private final Set<String> emailsAdministrativos;

    public AdminAccountService(
            UsuarioRepository usuarioRepository,
            @Value("${app.admin.emails:}") String emailsConfigurados
    ) {
        this.usuarioRepository = usuarioRepository;
        this.emailsAdministrativos = Arrays.stream(emailsConfigurados.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(email -> !email.isBlank())
                .collect(Collectors.toUnmodifiableSet());
    }

    public boolean deveSerAdmin(String email) {
        return email != null && emailsAdministrativos.contains(email.trim().toLowerCase());
    }

    @Transactional
    public Usuario sincronizar(Usuario usuario) {
        TipoConta tipoEsperado = deveSerAdmin(usuario.getEmail())
                ? TipoConta.ADMIN
                : usuario.getTipoConta();

        if (usuario.getTipoConta() != tipoEsperado) {
            usuario.setTipoConta(tipoEsperado);
            return usuarioRepository.save(usuario);
        }
        return usuario;
    }
}

package com.example.Help.model.recuperacao;

import com.example.Help.Service.AdminAccountService;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AutenticacaoService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final AdminAccountService adminAccountService;

    public AutenticacaoService(
            UsuarioRepository usuarioRepository,
            EmpresaRepository empresaRepository,
            AdminAccountService adminAccountService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.empresaRepository = empresaRepository;
        this.adminAccountService = adminAccountService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String email = Usuario.normalizarEmail(username);

        var usuario = usuarioRepository.findByEmailIgnoreCase(email).orElse(null);
        if (usuario != null) {
            return adminAccountService.sincronizar(usuario);
        }

        return empresaRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuário ou empresa não cadastrados com o e-mail informado."));
    }
}

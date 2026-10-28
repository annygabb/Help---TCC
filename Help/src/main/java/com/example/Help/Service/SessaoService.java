package com.example.Help.Service;

import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class SessaoService {

    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;

    public SessaoService(UsuarioRepository usuarioRepository, EmpresaRepository empresaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.empresaRepository = empresaRepository;
    }

    @Transactional
    public void invalidarContaAnterior(Authentication sessaoAtual, UserDetails novaConta) {
        if (sessaoAtual == null || !sessaoAtual.isAuthenticated()) return;

        Object principalAtual = sessaoAtual.getPrincipal();
        if (mesmaConta(principalAtual, novaConta)) return;

        if (principalAtual instanceof Usuario usuario) {
            usuario.setSessionVersion(UUID.randomUUID().toString());
            usuarioRepository.save(usuario);
        } else if (principalAtual instanceof Empresa empresa) {
            empresa.setSessionVersion(UUID.randomUUID().toString());
            empresaRepository.save(empresa);
        }
    }

    private boolean mesmaConta(Object contaAtual, UserDetails novaConta) {
        if (contaAtual instanceof Usuario atual && novaConta instanceof Usuario nova) {
            return atual.getId().equals(nova.getId());
        }
        if (contaAtual instanceof Empresa atual && novaConta instanceof Empresa nova) {
            return atual.getId().equals(nova.getId());
        }
        return false;
    }
}

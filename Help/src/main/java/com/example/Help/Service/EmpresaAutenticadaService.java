package com.example.Help.Service;

import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.empresa.EmpresaRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class EmpresaAutenticadaService {

    private final EmpresaRepository empresaRepository;

    public EmpresaAutenticadaService(EmpresaRepository empresaRepository) {
        this.empresaRepository = empresaRepository;
    }

    public Empresa obter(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new IllegalStateException("Empresa não autenticada.");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof Empresa empresa) {
            return empresa;
        }
        if (principal instanceof UserDetails userDetails) {
            return empresaRepository.findByEmailIgnoreCase(userDetails.getUsername())
                    .orElseThrow(() -> new IllegalStateException(
                            "Este recurso está disponível apenas para empresas."));
        }
        throw new IllegalStateException("Empresa não autenticada.");
    }
}

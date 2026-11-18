package com.example.Help.model.empresa;

import com.example.Help.model.usuario.Usuario;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/** Dados profissionais públicos, sem credenciais, CPF, e-mail ou detalhes de sessão. */
public record TalentoResumoDTO(UUID id, String nome, String cargo, String formacao,
                              String localizacao, List<String> skills, String fotoUrl) {
    public static TalentoResumoDTO de(Usuario usuario) {
        List<String> habilidades = usuario.getSkills() == null ? List.of() :
                Arrays.stream(usuario.getSkills().split("[,;\\n]"))
                        .map(String::trim).filter(s -> !s.isBlank()).toList();
        return new TalentoResumoDTO(usuario.getId(), usuario.getName(), usuario.getJobRole(),
                usuario.getFormacao(), usuario.getLocation(), habilidades, usuario.getFotoUrl());
    }
}

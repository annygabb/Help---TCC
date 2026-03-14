package com.example.Help.controller.usuario;

public record UsuarioResponseDTO(Long id, String name, String email, String password){
    public UsuarioResponseDTO(Usuario usuario){
        this(usuario.getId(), usuario.getName(), usuario.getEmail(), usuario.getPassword());
    }
}

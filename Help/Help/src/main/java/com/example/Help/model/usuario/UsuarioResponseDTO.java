package com.example.Help.model.usuario;

public record UsuarioResponseDTO(java.util.UUID id, String name, String email, String password){
    public UsuarioResponseDTO(Usuario usuario){
        this(usuario.getId(), usuario.getName(), usuario.getEmail(), usuario.getPassword());
    }
}

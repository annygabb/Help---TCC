package com.example.Help.model.usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    Optional<Usuario> findByEmail(String email); //ele retorna um valor vazio caso o email não esteja cadastrado
}
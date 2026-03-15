package com.example.Help.model.usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    boolean existsByEmail(String email);//Verifica se o email ja existe

    Optional<Usuario> findByEmail(String email); //faz o login funcionar
}
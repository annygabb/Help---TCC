package com.example.Help.model.usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByEmailIgnoreCase(String email);
    boolean existsByCpf(String cpf);
    Optional<Usuario> findByCpf(String cpf);
    List<Usuario> findBySkillsContainingIgnoreCase(String skill);
    List<Usuario> findByFormacaoContainingIgnoreCase(String formacao);
    List<Usuario> findByNameContainingIgnoreCaseOrFormacaoContainingIgnoreCase(String name, String formacao);
}

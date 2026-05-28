package com.example.Help.model.usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    boolean existsByEmail(String email);//verifica email
    Optional<Usuario> findByEmail(String email);
    List<Usuario> findBySkillsContainingIgnoreCase(String skill);//busca de candidatos por skill
    List<Usuario> findByFormacaoContainingIgnoreCase(String formacao);//busca candidatos por area de formação
    List<Usuario> findByNameContainingIgnoreCaseOrFormacaoContainingIgnoreCase(String name, String formacao);//busca candidatos que correspondam tanto a cargo quanto a formação.
}
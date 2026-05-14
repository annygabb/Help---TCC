package com.example.Help.model.perfil;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

@Repository
public interface PerfilRepository extends JpaRepository<Perfil, UUID> {

    Optional<Perfil> findByUsuarioId(UUID usuarioId);//busca o perfil pelo id

    List<Perfil> findByCargoAtualContainingIgnoreCase(String cargo);//busca o perfis por cargo

    List<Perfil> findBySkillsContainingIgnoreCase(String skill);//busca por habilidades

    boolean existsByUsuarioId(UUID usuarioId);//verificar se o perfil já existe
}
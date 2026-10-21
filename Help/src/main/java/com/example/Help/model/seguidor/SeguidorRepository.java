package com.example.Help.model.seguidor;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SeguidorRepository extends JpaRepository<Seguidor, UUID> {

    boolean existsBySeguidorUsuario_IdAndSeguidoUsuario_Id(UUID seguidorId, UUID seguidoId);//ja segue?

    Optional<Seguidor> findBySeguidorUsuario_IdAndSeguidoUsuario_Id(UUID seguidorId, UUID seguidoId);

    List<Seguidor> findBySeguidorUsuario_IdOrderByDataSeguindoDesc(UUID seguidorId);//quem eu sigo

    List<Seguidor> findBySeguidoUsuario_IdOrderByDataSeguindoDesc(UUID seguidoId);//quem me segue

    long countBySeguidoUsuario_Id(UUID seguidoId);

    long countBySeguidorUsuario_Id(UUID seguidorId);

    void deleteBySeguidorUsuario_IdAndSeguidoUsuario_Id(UUID seguidorId, UUID seguidoId);
}

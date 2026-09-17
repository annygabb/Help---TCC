package com.example.Help.model.seguidor;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SeguidorRepository extends JpaRepository<Seguidor, UUID> {

    boolean existsBySeguidor_IdAndSeguido_Id(UUID seguidorId, UUID seguidoId);//ja segue?

    Optional<Seguidor> findBySeguidor_IdAndSeguido_Id(UUID seguidorId, UUID seguidoId);

    List<Seguidor> findBySeguidor_IdOrderByDataSeguindoDesc(UUID seguidorId);//quem eu sigo

    List<Seguidor> findBySeguido_IdOrderByDataSeguindoDesc(UUID seguidoId);//quem me segue

    long countBySeguido_Id(UUID seguidoId);

    long countBySeguidor_Id(UUID seguidorId);

    void deleteBySeguidor_IdAndSeguido_Id(UUID seguidorId, UUID seguidoId);
}

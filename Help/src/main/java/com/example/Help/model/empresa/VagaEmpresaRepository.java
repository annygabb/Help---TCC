package com.example.Help.model.empresa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface VagaEmpresaRepository extends JpaRepository<VagaEmpresa, UUID> {
    List<VagaEmpresa> findByEmpresaIdOrderByDataPublicacaoDesc(UUID empresaId);
    Optional<VagaEmpresa> findByIdAndEmpresaId(UUID id, UUID empresaId);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from VagaEmpresa v where v.id = :id")
    Optional<VagaEmpresa> buscarParaCandidatura(@Param("id") UUID id);
}

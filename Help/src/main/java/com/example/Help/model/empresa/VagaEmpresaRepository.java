package com.example.Help.model.empresa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VagaEmpresaRepository extends JpaRepository<VagaEmpresa, UUID> {
    List<VagaEmpresa> findByEmpresaIdOrderByDataPublicacaoDesc(UUID empresaId);
    Optional<VagaEmpresa> findByIdAndEmpresaId(UUID id, UUID empresaId);
}

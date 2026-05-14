package com.example.Help.model.vaga;

import com.example.Help.model.vaga.VagaEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface VagaEmpresaRepository extends JpaRepository<VagaEmpresa, UUID> {
}
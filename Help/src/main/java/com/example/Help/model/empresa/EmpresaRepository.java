package com.example.Help.model.empresa;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface EmpresaRepository extends JpaRepository<Empresa, UUID> {
    Optional<Empresa> findByEmail(String email);
}
package com.example.Help.model.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AdminAuditRepository extends JpaRepository<AdminAuditLog, UUID> {
    List<AdminAuditLog> findByAlvoTipoAndAlvoIdOrderByDataHoraDesc(String alvoTipo, UUID alvoId);
}

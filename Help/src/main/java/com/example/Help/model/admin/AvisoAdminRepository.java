package com.example.Help.model.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AvisoAdminRepository extends JpaRepository<AvisoAdmin, UUID> {
    List<AvisoAdmin> findAllByOrderByCriadoEmDesc();
}

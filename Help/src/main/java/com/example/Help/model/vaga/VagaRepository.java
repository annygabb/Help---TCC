package com.example.Help.model.vaga;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface VagaRepository extends JpaRepository<Vaga, UUID> {
}
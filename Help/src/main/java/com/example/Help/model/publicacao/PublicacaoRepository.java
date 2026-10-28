package com.example.Help.model.publicacao;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PublicacaoRepository extends JpaRepository<Publicacao, UUID> {
    List<Publicacao> findAllByOrderByCriadaEmDesc();
}

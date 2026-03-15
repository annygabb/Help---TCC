package com.example.Help.model.vaga;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface VagaRepository extends JpaRepository<Vaga, UUID> {

    List<Vaga> findByTituloContainingIgnoreCase(String titulo);//vai buscar as vagas pelo nome
    List<Vaga> findByAnuncianteId(UUID usuarioId); //busca vagas que algum usuário específico criou
    List<Vaga> findAllByOrderByDataCriacaoDesc();//faz uma ordem pelas vagas que são mais recentes
}
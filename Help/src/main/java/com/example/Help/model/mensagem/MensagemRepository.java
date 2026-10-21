package com.example.Help.model.mensagem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MensagemRepository extends JpaRepository<Mensagem, UUID> {

    //pega a conversa nos dois sentidos, quem mandou e quem recebeu
    @Query("""
            SELECT m FROM Mensagem m
            WHERE (m.remetenteUsuario.id = :usuario1 AND m.destinatarioUsuario.id = :usuario2)
               OR (m.remetenteUsuario.id = :usuario2 AND m.destinatarioUsuario.id = :usuario1)
            ORDER BY m.dataEnvio ASC
            """)
    List<Mensagem> buscarConversa(@Param("usuario1") UUID usuario1, @Param("usuario2") UUID usuario2);

    @Query("""
            SELECT m FROM Mensagem m
            WHERE m.remetenteUsuario.id = :usuarioId OR m.destinatarioUsuario.id = :usuarioId
            ORDER BY m.dataEnvio DESC
            """)
    List<Mensagem> buscarTodasDoUsuario(@Param("usuarioId") UUID usuarioId);

    long countByDestinatarioUsuario_IdAndRemetenteUsuario_IdAndLidaFalse(UUID destinatarioId, UUID remetenteId);

    List<Mensagem> findByDestinatarioUsuario_IdAndRemetenteUsuario_IdAndLidaFalse(UUID destinatarioId, UUID remetenteId);
}

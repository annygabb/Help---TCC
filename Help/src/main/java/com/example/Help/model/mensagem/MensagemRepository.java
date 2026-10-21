package com.example.Help.model.mensagem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MensagemRepository extends JpaRepository<Mensagem, UUID> {

    @Query("""
            SELECT m FROM Mensagem m
            WHERE (((:u1 IS NOT NULL AND m.remetenteUsuario.id = :u1) OR (:e1 IS NOT NULL AND m.remetenteEmpresa.id = :e1))
               AND ((:u2 IS NOT NULL AND m.destinatarioUsuario.id = :u2) OR (:e2 IS NOT NULL AND m.destinatarioEmpresa.id = :e2)))
               OR (((:u2 IS NOT NULL AND m.remetenteUsuario.id = :u2) OR (:e2 IS NOT NULL AND m.remetenteEmpresa.id = :e2))
               AND ((:u1 IS NOT NULL AND m.destinatarioUsuario.id = :u1) OR (:e1 IS NOT NULL AND m.destinatarioEmpresa.id = :e1)))
            ORDER BY m.dataEnvio ASC
            """)
    List<Mensagem> buscarConversa(@Param("u1") UUID usuario1, @Param("e1") UUID empresa1,
                                  @Param("u2") UUID usuario2, @Param("e2") UUID empresa2);

    @Query("""
            SELECT m FROM Mensagem m
            WHERE (:usuarioId IS NOT NULL AND (m.remetenteUsuario.id = :usuarioId OR m.destinatarioUsuario.id = :usuarioId))
               OR (:empresaId IS NOT NULL AND (m.remetenteEmpresa.id = :empresaId OR m.destinatarioEmpresa.id = :empresaId))
            ORDER BY m.dataEnvio DESC
            """)
    List<Mensagem> buscarTodasDaConta(@Param("usuarioId") UUID usuarioId, @Param("empresaId") UUID empresaId);

    @Query("""
            SELECT COUNT(m) FROM Mensagem m
            WHERE m.lida = false
              AND ((:destU IS NOT NULL AND m.destinatarioUsuario.id = :destU) OR (:destE IS NOT NULL AND m.destinatarioEmpresa.id = :destE))
              AND ((:remU IS NOT NULL AND m.remetenteUsuario.id = :remU) OR (:remE IS NOT NULL AND m.remetenteEmpresa.id = :remE))
            """)
    long contarNaoLidas(@Param("destU") UUID destinatarioUsuario, @Param("destE") UUID destinatarioEmpresa,
                        @Param("remU") UUID remetenteUsuario, @Param("remE") UUID remetenteEmpresa);

    @Query("""
            SELECT m FROM Mensagem m
            WHERE m.lida = false
              AND ((:destU IS NOT NULL AND m.destinatarioUsuario.id = :destU) OR (:destE IS NOT NULL AND m.destinatarioEmpresa.id = :destE))
              AND ((:remU IS NOT NULL AND m.remetenteUsuario.id = :remU) OR (:remE IS NOT NULL AND m.remetenteEmpresa.id = :remE))
            """)
    List<Mensagem> buscarNaoLidas(@Param("destU") UUID destinatarioUsuario, @Param("destE") UUID destinatarioEmpresa,
                                  @Param("remU") UUID remetenteUsuario, @Param("remE") UUID remetenteEmpresa);
}

package com.example.Help.model.seguidor;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SeguidorRepository extends JpaRepository<Seguidor, UUID> {

    @Query("""
            SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Seguidor s
            WHERE ((:segU IS NOT NULL AND s.seguidorUsuario.id = :segU) OR (:segE IS NOT NULL AND s.seguidorEmpresa.id = :segE))
              AND ((:alvoU IS NOT NULL AND s.seguidoUsuario.id = :alvoU) OR (:alvoE IS NOT NULL AND s.seguidoEmpresa.id = :alvoE))
            """)
    boolean existe(@Param("segU") UUID seguidorUsuario, @Param("segE") UUID seguidorEmpresa,
                   @Param("alvoU") UUID seguidoUsuario, @Param("alvoE") UUID seguidoEmpresa);

    @Query("""
            SELECT s FROM Seguidor s
            WHERE ((:segU IS NOT NULL AND s.seguidorUsuario.id = :segU) OR (:segE IS NOT NULL AND s.seguidorEmpresa.id = :segE))
              AND ((:alvoU IS NOT NULL AND s.seguidoUsuario.id = :alvoU) OR (:alvoE IS NOT NULL AND s.seguidoEmpresa.id = :alvoE))
            """)
    Optional<Seguidor> encontrar(@Param("segU") UUID seguidorUsuario, @Param("segE") UUID seguidorEmpresa,
                                 @Param("alvoU") UUID seguidoUsuario, @Param("alvoE") UUID seguidoEmpresa);

    @Query("""
            SELECT s FROM Seguidor s
            WHERE (:usuarioId IS NOT NULL AND s.seguidorUsuario.id = :usuarioId)
               OR (:empresaId IS NOT NULL AND s.seguidorEmpresa.id = :empresaId)
            ORDER BY s.dataSeguindo DESC
            """)
    List<Seguidor> listarSeguindo(@Param("usuarioId") UUID usuarioId, @Param("empresaId") UUID empresaId);

    @Query("""
            SELECT s FROM Seguidor s
            WHERE (:usuarioId IS NOT NULL AND s.seguidoUsuario.id = :usuarioId)
               OR (:empresaId IS NOT NULL AND s.seguidoEmpresa.id = :empresaId)
            ORDER BY s.dataSeguindo DESC
            """)
    List<Seguidor> listarSeguidores(@Param("usuarioId") UUID usuarioId, @Param("empresaId") UUID empresaId);

    @Query("""
            SELECT COUNT(s) FROM Seguidor s WHERE (:usuarioId IS NOT NULL AND s.seguidoUsuario.id = :usuarioId)
            OR (:empresaId IS NOT NULL AND s.seguidoEmpresa.id = :empresaId)
            """)
    long contarSeguidores(@Param("usuarioId") UUID usuarioId, @Param("empresaId") UUID empresaId);

    @Query("""
            SELECT COUNT(s) FROM Seguidor s WHERE (:usuarioId IS NOT NULL AND s.seguidorUsuario.id = :usuarioId)
            OR (:empresaId IS NOT NULL AND s.seguidorEmpresa.id = :empresaId)
            """)
    long contarSeguindo(@Param("usuarioId") UUID usuarioId, @Param("empresaId") UUID empresaId);

    boolean existsBySeguidorUsuario_IdAndSeguidoUsuario_Id(UUID seguidorId, UUID seguidoId);//ja segue?

    Optional<Seguidor> findBySeguidorUsuario_IdAndSeguidoUsuario_Id(UUID seguidorId, UUID seguidoId);

    List<Seguidor> findBySeguidorUsuario_IdOrderByDataSeguindoDesc(UUID seguidorId);//quem eu sigo

    List<Seguidor> findBySeguidoUsuario_IdOrderByDataSeguindoDesc(UUID seguidoId);//quem me segue

    long countBySeguidoUsuario_Id(UUID seguidoId);

    long countBySeguidorUsuario_Id(UUID seguidorId);

    void deleteBySeguidorUsuario_IdAndSeguidoUsuario_Id(UUID seguidorId, UUID seguidoId);
}

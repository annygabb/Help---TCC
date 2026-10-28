package com.example.Help.model.notificacao;

import com.example.Help.model.social.TipoParticipante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificacaoRepository extends JpaRepository<Notificacao, UUID> {
    @Query("""
            SELECT n FROM Notificacao n
            WHERE (:usuarioId IS NOT NULL AND n.usuario.id = :usuarioId)
               OR (:empresaId IS NOT NULL AND n.empresa.id = :empresaId)
            ORDER BY n.dataCriacao DESC
            """)
    List<Notificacao> listar(@Param("usuarioId") UUID usuarioId, @Param("empresaId") UUID empresaId);

    @Query("""
            SELECT COUNT(n) FROM Notificacao n
            WHERE n.lida = false AND ((:usuarioId IS NOT NULL AND n.usuario.id = :usuarioId)
               OR (:empresaId IS NOT NULL AND n.empresa.id = :empresaId))
            """)
    long contarNaoLidas(@Param("usuarioId") UUID usuarioId, @Param("empresaId") UUID empresaId);

    @Query("""
            SELECT n FROM Notificacao n
            WHERE n.lida = false AND ((:usuarioId IS NOT NULL AND n.usuario.id = :usuarioId)
               OR (:empresaId IS NOT NULL AND n.empresa.id = :empresaId))
            """)
    List<Notificacao> listarNaoLidas(@Param("usuarioId") UUID usuarioId, @Param("empresaId") UUID empresaId);

    @Query("""
            SELECT n FROM Notificacao n
            WHERE n.lida = false AND n.origemId = :origemId AND n.origemTipo = :origemTipo AND n.tipo = :tipo
              AND ((:usuarioId IS NOT NULL AND n.usuario.id = :usuarioId)
               OR (:empresaId IS NOT NULL AND n.empresa.id = :empresaId))
            """)
    Optional<Notificacao> encontrarNaoLida(@Param("usuarioId") UUID usuarioId,
                                           @Param("empresaId") UUID empresaId,
                                           @Param("origemId") UUID origemId,
                                           @Param("origemTipo") TipoParticipante origemTipo,
                                           @Param("tipo") TipoNotificacao tipo);

    @Query(value = "SELECT foto_url FROM usuarios WHERE id = :id", nativeQuery = true)
    String buscarFotoUsuario(@Param("id") UUID id);

    @Query(value = "SELECT foto_url FROM empresas WHERE id = :id", nativeQuery = true)
    String buscarFotoEmpresa(@Param("id") UUID id);
}

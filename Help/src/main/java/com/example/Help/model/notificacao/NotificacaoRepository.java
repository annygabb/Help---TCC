package com.example.Help.model.notificacao;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificacaoRepository extends JpaRepository<Notificacao, UUID> {

    List<Notificacao> findByUsuario_IdOrderByDataCriacaoDesc(UUID usuarioId);//lista da mais nova pra mais antiga

    long countByUsuario_IdAndLidaFalse(UUID usuarioId);//total pro badge

    List<Notificacao> findByUsuario_IdAndLidaFalse(UUID usuarioId);

    Optional<Notificacao> findFirstByUsuario_IdAndOrigemIdAndTipoAndLidaFalse(
            UUID usuarioId, UUID origemId, TipoNotificacao tipo);//evita repetir notificação da mesma pessoa
}

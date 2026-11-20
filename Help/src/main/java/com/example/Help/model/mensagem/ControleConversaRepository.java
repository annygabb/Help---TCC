package com.example.Help.model.mensagem;

import com.example.Help.model.social.TipoParticipante;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ControleConversaRepository extends JpaRepository<ControleConversa, UUID> {
    Optional<ControleConversa> findByContaIdAndContaTipoAndOutroIdAndOutroTipo(UUID conta, TipoParticipante tipo, UUID outro, TipoParticipante outroTipo);
    List<ControleConversa> findByContaIdAndContaTipo(UUID conta, TipoParticipante tipo);
    boolean existsByContaIdAndContaTipoAndOutroIdAndOutroTipoAndBloqueadoTrue(UUID conta, TipoParticipante tipo, UUID outro, TipoParticipante outroTipo);
}

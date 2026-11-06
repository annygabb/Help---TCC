package com.example.Help.model.denuncia;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DenunciaRepository extends JpaRepository<Denuncia, UUID> {
    List<Denuncia> findByDenuncianteTipoAndDenuncianteIdOrderByCriadaEmDesc(com.example.Help.model.social.TipoParticipante tipo, UUID id);
}

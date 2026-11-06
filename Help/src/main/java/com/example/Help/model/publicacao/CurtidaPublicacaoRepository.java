package com.example.Help.model.publicacao;
import com.example.Help.model.social.TipoParticipante;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional; import java.util.UUID;
public interface CurtidaPublicacaoRepository extends JpaRepository<CurtidaPublicacao,UUID>{
 Optional<CurtidaPublicacao> findByPublicacaoIdAndParticipanteIdAndParticipanteTipo(UUID p, UUID a, TipoParticipante t);
 default Optional<CurtidaPublicacao> findByPublicacaoIdAndParticipante(UUID p, UUID a, TipoParticipante t){return findByPublicacaoIdAndParticipanteIdAndParticipanteTipo(p,a,t);}
 long countByPublicacaoId(UUID p);
}

package com.example.Help.model.publicacao;
import com.example.Help.model.social.ParticipanteSocial;
import com.example.Help.model.social.TipoParticipante;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.UUID;
@Entity @Table(name="curtidas_publicacao", uniqueConstraints=@UniqueConstraint(name="uk_curtida_publicacao_conta", columnNames={"publicacao_id","participante_id","participante_tipo"}))
@Getter @NoArgsConstructor
public class CurtidaPublicacao {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="publicacao_id") private Publicacao publicacao;
 @Column(name="participante_id", nullable=false) private UUID participanteId;
 @Enumerated(EnumType.STRING) @Column(name="participante_tipo", nullable=false, length=20) private TipoParticipante participanteTipo;
 public CurtidaPublicacao(Publicacao p, ParticipanteSocial a){publicacao=p;participanteId=a.getId();participanteTipo=a.getTipoParticipante();}
}

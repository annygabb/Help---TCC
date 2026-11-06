package com.example.Help.model.publicacao;
import com.example.Help.model.social.ParticipanteSocial; import com.example.Help.model.social.TipoParticipante;
import jakarta.persistence.*; import lombok.*; import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime; import java.util.UUID;
@Entity @Table(name="comentarios_publicacao") @Getter @Setter @NoArgsConstructor
public class ComentarioPublicacao {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="publicacao_id") private Publicacao publicacao;
 @Column(name="autor_id",nullable=false) private UUID autorId;
 @Enumerated(EnumType.STRING) @Column(name="autor_tipo",nullable=false,length=20) private TipoParticipante autorTipo;
 @Column(name="autor_nome",nullable=false,length=160) private String autorNome;
 @Column(name="autor_foto_url",columnDefinition="TEXT") private String autorFotoUrl;
 @Column(nullable=false,length=1000) private String conteudo;
 @CreationTimestamp @Column(name="criado_em",nullable=false,updatable=false) private LocalDateTime criadoEm;
 public ComentarioPublicacao(Publicacao p,ParticipanteSocial a,String c){publicacao=p;autorId=a.getId();autorTipo=a.getTipoParticipante();autorNome=a.getNomeSocial();autorFotoUrl=a.getFotoUrl();conteudo=c;}
}

package com.example.Help.model.denuncia;

import com.example.Help.model.social.TipoParticipante;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name = "denuncias") @Getter @Setter @NoArgsConstructor
public class Denuncia {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private TipoParticipante denuncianteTipo;
    @Column(nullable=false) private UUID denuncianteId;
    @Column(nullable=false, length=150) private String denuncianteNome;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private TipoAlvoDenuncia alvoTipo;
    @Column(nullable=false) private UUID alvoId;
    @Column(nullable=false, length=180) private String alvoNome;
    @Column(nullable=false, length=120) private String motivo;
    @Column(length=2000) private String descricao;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private PrioridadeDenuncia prioridade = PrioridadeDenuncia.MEDIA;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private StatusDenuncia status = StatusDenuncia.PENDENTE;
    @Column(length=50) private String decisao;
    @Column(length=1000) private String justificativa;
    private UUID adminId;
    private String adminNome;
    @CreationTimestamp @Column(nullable=false, updatable=false) private LocalDateTime criadaEm;
    private LocalDateTime atualizadaEm;
}

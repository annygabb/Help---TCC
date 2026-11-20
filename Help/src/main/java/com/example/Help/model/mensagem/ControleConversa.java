package com.example.Help.model.mensagem;

import com.example.Help.model.social.TipoParticipante;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "controle_conversas", uniqueConstraints = @UniqueConstraint(name = "uk_controle_conversa", columnNames = {"conta_id", "conta_tipo", "outro_id", "outro_tipo"}))
@Getter @Setter @NoArgsConstructor
public class ControleConversa {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name="conta_id", nullable=false) private UUID contaId;
    @Enumerated(EnumType.STRING) @Column(name="conta_tipo", nullable=false, length=20) private TipoParticipante contaTipo;
    @Column(name="outro_id", nullable=false) private UUID outroId;
    @Enumerated(EnumType.STRING) @Column(name="outro_tipo", nullable=false, length=20) private TipoParticipante outroTipo;
    @Column(nullable=false) private boolean bloqueado;
    @Column(name="oculta_ate") private LocalDateTime ocultaAte;
}

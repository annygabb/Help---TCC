package com.example.Help.model.seguidor;

import com.example.Help.model.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Table(
        name = "seguidores",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_seguidor_seguido",
                columnNames = {"seguidor_id", "seguido_id"}
        )
)//a constraint impede seguir a mesma pessoa duas vezes
@Entity(name = "Seguidor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Seguidor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seguidor_id", nullable = false)//quem esta seguindo
    private Usuario seguidor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seguido_id", nullable = false)//quem esta sendo seguido
    private Usuario seguido;

    private LocalDateTime dataSeguindo;

    public Seguidor(Usuario seguidor, Usuario seguido) {
        this.seguidor = seguidor;
        this.seguido = seguido;
        this.dataSeguindo = LocalDateTime.now();
    }
}

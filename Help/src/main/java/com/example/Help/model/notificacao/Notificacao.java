package com.example.Help.model.notificacao;

import com.example.Help.model.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Table(name = "notificacoes")
@Entity(name = "Notificacao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)//quem recebe a notificação
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    private TipoNotificacao tipo;

    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String mensagem;

    private UUID origemId;//quem gerou a notificação

    private String origemNome;

    private boolean lida = false;

    private LocalDateTime dataCriacao;

    public Notificacao(Usuario usuario, TipoNotificacao tipo, String titulo,
                       String mensagem, UUID origemId, String origemNome) {
        this.usuario = usuario;
        this.tipo = tipo;
        this.titulo = titulo;
        this.mensagem = mensagem;
        this.origemId = origemId;
        this.origemNome = origemNome;
        this.lida = false;
        this.dataCriacao = LocalDateTime.now();
    }
}

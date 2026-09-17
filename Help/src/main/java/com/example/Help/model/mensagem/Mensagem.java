package com.example.Help.model.mensagem;

import com.example.Help.model.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Table(name = "mensagens")
@Entity(name = "Mensagem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Mensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "remetente_id", nullable = false)//quem enviou
    private Usuario remetente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destinatario_id", nullable = false)//quem recebe
    private Usuario destinatario;

    @Column(columnDefinition = "TEXT", nullable = false)//mensagem de qualquer tamanho
    private String conteudo;

    private LocalDateTime dataEnvio;

    private boolean lida = false;

    public Mensagem(Usuario remetente, Usuario destinatario, String conteudo) {
        this.remetente = remetente;
        this.destinatario = destinatario;
        this.conteudo = conteudo;
        this.dataEnvio = LocalDateTime.now();
        this.lida = false;
    }
}

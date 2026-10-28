package com.example.Help.model.notificacao;

import com.example.Help.Service.DataHora;
import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.social.ParticipanteSocial;
import com.example.Help.model.social.TipoParticipante;
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
@EqualsAndHashCode(of = "id")
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @Enumerated(EnumType.STRING)
    private TipoNotificacao tipo;
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String mensagem;

    private UUID origemId;
    private String origemNome;

    @Enumerated(EnumType.STRING)
    private TipoParticipante origemTipo;

    private boolean lida;
    private LocalDateTime dataCriacao;

    public Notificacao(Usuario usuario, TipoNotificacao tipo, String titulo,
                       String mensagem, UUID origemId, String origemNome) {
        this(usuario, tipo, titulo, mensagem, origemId, origemNome, TipoParticipante.USUARIO);
    }

    public Notificacao(ParticipanteSocial destinatario, TipoNotificacao tipo, String titulo,
                       String mensagem, UUID origemId, String origemNome, TipoParticipante origemTipo) {
        atribuirDestinatario(destinatario);
        this.tipo = tipo;
        this.titulo = titulo;
        this.mensagem = mensagem;
        this.origemId = origemId;
        this.origemNome = origemNome;
        this.origemTipo = origemTipo;
        this.lida = false;
        this.dataCriacao = DataHora.agoraUtc();
        validarDestinatario();
    }

    public ParticipanteSocial getDestinatarioSocial() {
        return usuario != null ? usuario : empresa;
    }

    @PrePersist
    @PreUpdate
    public void validarDestinatario() {
        if ((usuario == null) == (empresa == null)) {
            throw new IllegalStateException("A notificacao deve possuir exatamente um destinatario.");
        }
    }

    private void atribuirDestinatario(ParticipanteSocial participante) {
        if (participante instanceof Usuario destinatarioUsuario) usuario = destinatarioUsuario;
        else if (participante instanceof Empresa destinatarioEmpresa) empresa = destinatarioEmpresa;
        else throw new IllegalArgumentException("Tipo de destinatario nao suportado.");
    }
}

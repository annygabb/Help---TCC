package com.example.Help.model.mensagem;

import com.example.Help.Service.DataHora;
import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.social.ParticipanteSocial;
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
@EqualsAndHashCode(of = "id")
public class Mensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "remetente_id")
    private Usuario remetenteUsuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "remetente_empresa_id")
    private Empresa remetenteEmpresa;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destinatario_id")
    private Usuario destinatarioUsuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destinatario_empresa_id")
    private Empresa destinatarioEmpresa;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String conteudo;

    private LocalDateTime dataEnvio;
    private boolean lida;

    public Mensagem(Usuario remetente, Usuario destinatario, String conteudo) {
        this((ParticipanteSocial) remetente, destinatario, conteudo);
    }

    public Mensagem(ParticipanteSocial remetente, ParticipanteSocial destinatario, String conteudo) {
        atribuirRemetente(remetente);
        atribuirDestinatario(destinatario);
        this.conteudo = conteudo;
        this.dataEnvio = DataHora.agoraUtc();
        this.lida = false;
        validarParticipantes();
    }

    public ParticipanteSocial getRemetenteSocial() {
        return remetenteUsuario != null ? remetenteUsuario : remetenteEmpresa;
    }

    public ParticipanteSocial getDestinatarioSocial() {
        return destinatarioUsuario != null ? destinatarioUsuario : destinatarioEmpresa;
    }

    /** Compatibilidade temporaria com os fluxos antigos exclusivamente entre usuarios. */
    public Usuario getRemetente() {
        return remetenteUsuario;
    }

    /** Compatibilidade temporaria com os fluxos antigos exclusivamente entre usuarios. */
    public Usuario getDestinatario() {
        return destinatarioUsuario;
    }

    @PrePersist
    @PreUpdate
    public void validarParticipantes() {
        if ((remetenteUsuario == null) == (remetenteEmpresa == null)) {
            throw new IllegalStateException("A mensagem deve possuir exatamente um remetente.");
        }
        if ((destinatarioUsuario == null) == (destinatarioEmpresa == null)) {
            throw new IllegalStateException("A mensagem deve possuir exatamente um destinatario.");
        }
        ParticipanteSocial remetente = getRemetenteSocial();
        ParticipanteSocial destinatario = getDestinatarioSocial();
        if (remetente.getTipoParticipante() == destinatario.getTipoParticipante()
                && remetente.getId().equals(destinatario.getId())) {
            throw new IllegalStateException("Uma conta nao pode enviar mensagem para si mesma.");
        }
    }

    private void atribuirRemetente(ParticipanteSocial participante) {
        if (participante instanceof Usuario usuario) remetenteUsuario = usuario;
        else if (participante instanceof Empresa empresa) remetenteEmpresa = empresa;
        else throw new IllegalArgumentException("Tipo de remetente nao suportado.");
    }

    private void atribuirDestinatario(ParticipanteSocial participante) {
        if (participante instanceof Usuario usuario) destinatarioUsuario = usuario;
        else if (participante instanceof Empresa empresa) destinatarioEmpresa = empresa;
        else throw new IllegalArgumentException("Tipo de destinatario nao suportado.");
    }
}

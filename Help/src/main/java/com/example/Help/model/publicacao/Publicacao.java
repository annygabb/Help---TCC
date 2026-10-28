package com.example.Help.model.publicacao;

import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.social.ParticipanteSocial;
import com.example.Help.model.social.TipoParticipante;
import com.example.Help.model.usuario.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "publicacoes")
@Getter @Setter @NoArgsConstructor
public class Publicacao {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_usuario_id")
    private Usuario autorUsuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_empresa_id")
    private Empresa autorEmpresa;

    @Column(columnDefinition = "TEXT")
    private String conteudo;

    @Column(name = "midia_url", columnDefinition = "TEXT")
    private String midiaUrl;

    @Column(name = "midia_tipo", length = 20)
    private String midiaTipo;

    @Enumerated(EnumType.STRING)
    @Column(name = "permissao_comentario", nullable = false, length = 20)
    private PermissaoComentario permissaoComentario = PermissaoComentario.TODOS;

    @CreationTimestamp
    @Column(name = "criada_em", nullable = false, updatable = false)
    private LocalDateTime criadaEm;

    public Publicacao(ParticipanteSocial autor, String conteudo, String midiaUrl,
                      String midiaTipo, PermissaoComentario permissao) {
        if (autor.getTipoParticipante() == TipoParticipante.USUARIO) this.autorUsuario = (Usuario) autor;
        else this.autorEmpresa = (Empresa) autor;
        this.conteudo = conteudo;
        this.midiaUrl = midiaUrl;
        this.midiaTipo = midiaTipo;
        this.permissaoComentario = permissao;
    }

    public ParticipanteSocial getAutorSocial() {
        return autorUsuario != null ? autorUsuario : autorEmpresa;
    }
}

package com.example.Help.model.seguidor;

import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.social.ParticipanteSocial;
import com.example.Help.model.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Table(name = "seguidores", uniqueConstraints = {
        @UniqueConstraint(name = "uk_seguidor_uu", columnNames = {"seguidor_id", "seguido_id"}),
        @UniqueConstraint(name = "uk_seguidor_ue", columnNames = {"seguidor_id", "seguido_empresa_id"}),
        @UniqueConstraint(name = "uk_seguidor_eu", columnNames = {"seguidor_empresa_id", "seguido_id"}),
        @UniqueConstraint(name = "uk_seguidor_ee", columnNames = {"seguidor_empresa_id", "seguido_empresa_id"})
})
@Entity(name = "Seguidor")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Seguidor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seguidor_id")
    private Usuario seguidorUsuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seguidor_empresa_id")
    private Empresa seguidorEmpresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seguido_id")
    private Usuario seguidoUsuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seguido_empresa_id")
    private Empresa seguidoEmpresa;

    private LocalDateTime dataSeguindo;

    public Seguidor(Usuario seguidor, Usuario seguido) {
        this((ParticipanteSocial) seguidor, seguido);
    }

    public Seguidor(ParticipanteSocial seguidor, ParticipanteSocial seguido) {
        atribuirSeguidor(seguidor);
        atribuirSeguido(seguido);
        this.dataSeguindo = LocalDateTime.now();
        validarParticipantes();
    }

    public ParticipanteSocial getSeguidorSocial() {
        return seguidorUsuario != null ? seguidorUsuario : seguidorEmpresa;
    }

    public ParticipanteSocial getSeguidoSocial() {
        return seguidoUsuario != null ? seguidoUsuario : seguidoEmpresa;
    }

    public Usuario getSeguidor() { return seguidorUsuario; }
    public Usuario getSeguido() { return seguidoUsuario; }

    @PrePersist
    @PreUpdate
    public void validarParticipantes() {
        if ((seguidorUsuario == null) == (seguidorEmpresa == null)) {
            throw new IllegalStateException("O relacionamento deve possuir exatamente um seguidor.");
        }
        if ((seguidoUsuario == null) == (seguidoEmpresa == null)) {
            throw new IllegalStateException("O relacionamento deve possuir exatamente uma conta seguida.");
        }
        ParticipanteSocial seguidor = getSeguidorSocial();
        ParticipanteSocial seguido = getSeguidoSocial();
        if (seguidor.getTipoParticipante() == seguido.getTipoParticipante()
                && seguidor.getId().equals(seguido.getId())) {
            throw new IllegalStateException("Uma conta nao pode seguir a si mesma.");
        }
    }

    private void atribuirSeguidor(ParticipanteSocial participante) {
        if (participante instanceof Usuario usuario) seguidorUsuario = usuario;
        else if (participante instanceof Empresa empresa) seguidorEmpresa = empresa;
        else throw new IllegalArgumentException("Tipo de seguidor nao suportado.");
    }

    private void atribuirSeguido(ParticipanteSocial participante) {
        if (participante instanceof Usuario usuario) seguidoUsuario = usuario;
        else if (participante instanceof Empresa empresa) seguidoEmpresa = empresa;
        else throw new IllegalArgumentException("Tipo de conta seguida nao suportado.");
    }
}

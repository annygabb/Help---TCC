package com.example.Help.model.empresa;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.example.Help.model.social.ParticipanteSocial;
import com.example.Help.model.social.TipoParticipante;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Table(name = "empresas")
@Entity(name = "Empresa")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Empresa implements UserDetails, ParticipanteSocial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Getter @Setter
    private UUID id;

    @Getter @Setter
    @Column(name = "corporate_name", nullable = false)
    private String corporateName;

    @Column(unique = true, nullable = false)
    @Getter @Setter
    private String cnpj;

    @Column(unique = true, nullable = false)
    @Getter @Setter
    private String email;

    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    @Getter @Setter
    @Column(nullable = false)
    private String password;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    @Getter
    private LocalDateTime criadoEm;

    @Column(name = "motivo_status", length = 500)
    @Getter @Setter
    private String motivoStatus;

    @PrePersist
    @PreUpdate
    void normalizarAntesDeSalvar() {
        this.email = normalizarEmail(this.email);
        if (this.ativo == null) this.ativo = true;
    }

    public static String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    public boolean isAtivo() {
        return ativo == null || ativo;
    }

    @Override
    public TipoParticipante getTipoParticipante() {
        return TipoParticipante.EMPRESA;
    }

    @Override
    public String getNomeSocial() {
        return this.corporateName;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public String getSenha() {
        return this.password;
    }

    public void setSenha(String senha) {
        this.password = senha;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_EMPRESA"));
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return isAtivo(); }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return isAtivo(); }
}

package com.example.Help.model.usuario;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
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

@Table(name = "usuarios")
@Entity(name = "Usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@JsonPropertyOrder({ "id", "nome", "email", "cargo", "localizacao", "formacao", "skills", "bio" })
public class Usuario implements UserDetails, ParticipanteSocial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonProperty("nome")
    @Column(name = "nome", nullable = false)
    private String name;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "cpf", unique = true, length = 14)
    private String cpf;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "senha", nullable = false)
    private String senha;

    @JsonProperty("cargo")
    private String jobRole;

    @JsonProperty("localizacao")
    private String location;

    @JsonProperty("formacao")
    private String formacao;

    @JsonProperty("skills")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "foto_url", columnDefinition = "TEXT")
    private String fotoUrl;

    @Column(name = "session_version", length = 36)
    private String sessionVersion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_conta", length = 20)
    private TipoConta tipoConta = TipoConta.CANDIDATO;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "motivo_status", length = 500)
    private String motivoStatus;

    public Usuario(UsuarioRequestDTO data) {
        this.name = data.name();
        this.email = normalizarEmail(data.email());
        this.senha = data.password();
        this.jobRole = data.jobRole();
        this.location = data.userLocation();
        this.formacao = data.formacao();
        this.skills = data.skills();
        this.bio = data.userBio();
        this.tipoConta = TipoConta.CANDIDATO;
        this.ativo = true;
    }

    @PrePersist
    @PreUpdate
    void normalizarAntesDeSalvar() {
        this.email = normalizarEmail(this.email);
        if (this.tipoConta == null) this.tipoConta = TipoConta.CANDIDATO;
        if (this.ativo == null) this.ativo = true;
    }

    public static String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    public TipoConta getTipoConta() {
        return tipoConta == null ? TipoConta.CANDIDATO : tipoConta;
    }

    public boolean isAtivo() {
        return ativo == null || ativo;
    }

    @Override
    public TipoParticipante getTipoParticipante() {
        return TipoParticipante.USUARIO;
    }

    @Override
    public String getNomeSocial() {
        return this.name;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public String getCargo() {
        return this.jobRole;
    }

    public void setCargo(String cargo) {
        this.jobRole = cargo;
    }

    public String getCidade() {
        return this.location;
    }

    public void setCidade(String cidade) {
        this.location = cidade;
    }

    public String getTelefone() {
        return null;
    }

    public void setTelefone(String telefone) {
    }

    public String getEstado() {
        return "";
    }

    public void setEstado(String estado) {
    }

    public String getCurriculo() {
        return this.bio;
    }

    public void setCurriculo(String curriculo) {
        this.bio = curriculo;
    }

    public Double getSalarioBase() {
        return 0.0;
    }

    public void setSalarioBase(Double salarioBase) {
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String role = getTipoConta() == TipoConta.ADMIN ? "ROLE_ADMIN" : "ROLE_USER";
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() {
        return this.senha;
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

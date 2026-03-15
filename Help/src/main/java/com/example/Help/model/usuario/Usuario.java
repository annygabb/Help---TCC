package com.example.Help.model.usuario;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.*;
import lombok.*;
import org.jspecify.annotations.NonNull;

import java.util.UUID;

@Table(name = "usuarios")
@Entity(name = "Usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@JsonPropertyOrder({ "id", "name", "email", "password", "jobRole", "location", "bio" })

public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @JsonProperty("nome")
    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    @JsonProperty("cargo")
    private String jobRole;

    @JsonProperty("localizacao")
    private String location;

    @Column(columnDefinition = "TEXT")
    private String bio;

    public Usuario(@NonNull UsuarioRequestDTO data) {
        this.name = data.name();
        this.email = data.email();
        this.password = data.password();
        this.jobRole = data.job_role();
        this.location = data.user_location();
        this.bio = data.user_bio();
    }
}
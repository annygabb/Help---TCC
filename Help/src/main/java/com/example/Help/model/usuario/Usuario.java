package com.example.Help.model.usuario;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Table
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@JsonPropertyOrder({ "name", "id", "email", "password" })

public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonProperty("nome")
    private String name;

    @Column(unique = true)
    private String email;
    private String password;
    private String jobRole;
    private String location;

    @Column(columnDefinition = "TEXT") //Permite textos longos para a Bio
    private String bio;

    public Usuario(UsuarioRequestDTO data) {
        this.email = data.email();
        this.password = data.password();
        this.name = data.name();
        this.jobRole = data.job_role();
        this.location = data.user_location();
        this.bio = data.user_bio();

        }
}

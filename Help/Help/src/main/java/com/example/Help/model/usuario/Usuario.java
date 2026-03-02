package com.example.Help.model.usuario;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Table
@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@JsonPropertyOrder({ "name", "id", "email", "password" })

public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) //IDENTITY) manda pro banco criar o ID //uuid mais seguro
    //private UUID id;//
    private UUID id;
    @JsonProperty("nome")
    private String name;
    @Column(unique = true)
    private String email;
    private String password;
    public Usuario(UsuarioRequestDTO data) {
        this.email = data.email();
        this.password = data.password();
        this.name = data.name();

        }
}

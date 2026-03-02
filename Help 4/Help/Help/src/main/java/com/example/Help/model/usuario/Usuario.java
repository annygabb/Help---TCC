package com.example.Help.model.usuario;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Table
@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) //IDENTITY) manda pro banco criar o ID //uuid mais seguro
    //private UUID id;//
    private UUID id;
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

package com.example.Help.model.perfil;

import com.example.Help.model.usuario.Usuario;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "perfis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonPropertyOrder({ "bio", "cargoAtual", "usuario", "id" })
public class Perfil {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String bio;
    private String fotoUrl;
    private String cargoAtual;
    private String linkedinUrl;
    @OneToOne //faz o usuario ter apenas 1 perfil
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
}



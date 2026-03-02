package com.example.Help.model;

import com.example.Help.model.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;
import com.example.Help.model.usuario.Usuario;

@Entity
@Table(name = "perfis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Perfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String bio;
    private String fotoUrl;
    private String cargoAtual;
    private String linkedinUrl;
    @OneToOne //faz o usuario ter apenas 1 perfil
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
}



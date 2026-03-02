package com.example.Help.controller.usuario;

import jakarta.persistence.*;
import lombok.*;

@Table(name = "usuarios")
@Entity(name = "usuarios")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Usuario {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private Long id;
    private String name;
    private String email;
    private String password;

        public Usuario(UsuarioRequestDTO data) {
            this.email = data.email();
            this.password = data.password();
            this.name = data.password();

        }
}

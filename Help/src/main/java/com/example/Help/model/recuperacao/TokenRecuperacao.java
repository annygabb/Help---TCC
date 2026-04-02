package com.example.Help.model.recuperacao;

import com.example.Help.model.usuario.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tokens_recuperacao")
@Getter
@Setter
@NoArgsConstructor
public class TokenRecuperacao {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String token;

    @OneToOne(targetEntity = Usuario.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false)
    private LocalDateTime dataExpiracao;

    public TokenRecuperacao(String token, Usuario usuario) {
        this.token = token;
        this.usuario = usuario;
        this.dataExpiracao = LocalDateTime.now().plusMinutes(15);
    }
}
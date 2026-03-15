package com.example.Help.model.perfil;

import com.example.Help.model.usuario.Usuario;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "perfis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder // Facilita a criação de objetos nos testes e no Service
@JsonPropertyOrder({ "id", "cargoAtual", "bio", "usuario" })
public class Perfil {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(columnDefinition = "TEXT") //faz a bio ser longa no postgre

    private String bio;
    private String fotoUrl;

    @Column(length = 100) //ta limitando o banco por enquanto para 100, por conta de garantir um desempenho
    private String cargoAtual;

    private String linkedinUrl;

    @OneToOne(fetch = FetchType.LAZY) //ao inves de carregar toda consulta envolvendo usuarios e seus dados, ele traz so o necessario
    @JoinColumn(name = "usuario_id", nullable = false) //faz ser impossivel ter perfil sem usuario
    private Usuario usuario;

    @CreationTimestamp //mostra que horas os dados do banco foram inseridos pela primeira vez
    @Column(updatable = false) //nao deixa alterar informações extremamente importante
    private LocalDateTime dataCriacao;

    @UpdateTimestamp //atualiza automatico alguns dados ex:trocou bio
    private LocalDateTime dataAtualizacao;
}
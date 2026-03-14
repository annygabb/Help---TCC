package com.example.Help.model.cadastro;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity //uma classe do banco de dados
@Table(name = "usuarios")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@JsonPropertyOrder({ "name", "id", "email", "password" }) //ordem que o react vai receber
public class Cadastro {
    @Id //define que primeira key é o id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonProperty("nome")//permite que o front use nome
    private String name;
    private String email;
    private String password;
}
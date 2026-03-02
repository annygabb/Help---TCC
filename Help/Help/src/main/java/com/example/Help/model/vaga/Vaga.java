package com.example.Help.model.vaga;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "vagas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Vaga {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String titulo;
    private String empresa;
@Column(columnDefinition = "TEXT")
    private String descricao;
    private Double salario;
}
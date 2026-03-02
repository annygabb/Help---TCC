package com.example.Help.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vagas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Vaga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titulo;
    private String empresa;
@Column(columnDefinition = "TEXT")
    private String descricao;
    private Double salario;
}
package com.example.Help.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cursos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;
    private String instrutor;
    private Integer cargaHoraria; // para ser em horas
    private String categoria; // Ex: Programação, Design, Soft Skills
    private Boolean gratuito; // true = Grátis, false = Pago
    private Double preco; // Se não for gratuito, aqui guardamos o valor
}
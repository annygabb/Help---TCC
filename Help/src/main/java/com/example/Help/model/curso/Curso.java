package com.example.Help.model.curso;

import com.example.Help.model.usuario.Usuario;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "cursos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;
    private String instrutor;
    private Integer cargaHoraria; // para ser em horas
    private String categoria; // Ex: Programação, Design, Soft Skills
    private Boolean gratuito; // true = Grátis, false = Pago
    private Double preco; // Se não for gratuito, aqui terá o valor
    private Integer progresso;//BARRA DE PROGRESSO

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Usuario aluno;

    public Curso(CursoRequestDTO data, Usuario aluno) {
        this.nome = data.nome();
        this.descricao = data.descricao();
        this.instrutor = data.instrutor();
        this.cargaHoraria = data.cargaHoraria();
        this.categoria = data.categoria();
        this.gratuito = data.gratuito();
        this.preco = data.preco();
        this.progresso = 0; // Inicia com 0%
        this.aluno = aluno;
    }
}
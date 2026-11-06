package com.example.Help.model.admin;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "avisos_admin")
@Getter @Setter @NoArgsConstructor
public class AvisoAdmin {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, length = 90) private String titulo;
    @Column(nullable = false, columnDefinition = "TEXT") private String mensagem;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private PublicoAviso publico;
    @Column(nullable = false, length = 20) private String prioridade;
    @Column(nullable = false, length = 120) private String destino;
    @Column(nullable = false) private int entregues;
    @CreationTimestamp @Column(nullable = false, updatable = false) private LocalDateTime criadoEm;

    public AvisoAdmin(String titulo, String mensagem, PublicoAviso publico, String prioridade, String destino) {
        this.titulo = titulo;
        this.mensagem = mensagem;
        this.publico = publico;
        this.prioridade = prioridade;
        this.destino = destino;
    }
}

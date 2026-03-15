package com.example.Help.model.vaga;

import com.example.Help.model.usuario.Usuario;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vagas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vaga {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
    private UUID id;

    @Column(nullable = false, length = 100)
    private String titulo;

    @Column(nullable = false)
    private String empresa;

    @Column(columnDefinition = "TEXT")
    private String descricao;
    private Double salario;
    private String localizacao;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private Usuario anunciante;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime dataCriacao;

    @UpdateTimestamp
    private LocalDateTime dataAtualizacao;

    public Vaga(VagaRequestDTO data, Usuario anunciante) {
        this.titulo = data.titulo();
        this.empresa = data.empresa();
        this.descricao = data.descricao();
        this.salario = data.salario();
        this.localizacao = data.localizacao();
        this.anunciante = anunciante;
    }
}
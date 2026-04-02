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

    @Column(nullable = false, length = 100)//titulo da vaga é algo obrigatório e max de caractere é 100
    private String titulo;

    @Column(nullable = false)
    private String empresa;

    @Column(columnDefinition = "TEXT")//faz que as descrições das vagas sejam de qualquer tamanho
    private String descricao;
    private Double salario;
    private String localizacao;

    @ManyToOne(fetch = FetchType.EAGER)//isso faz com quem muitas vagas podem ser criadas por uma pessoa
    @JoinColumn(name = "usuario_id", nullable = false)//isso faz que toda vaga seja atribuida para um perfil, ou seja, precisa de um criador e faz uma busca pelo id
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private Usuario anunciante;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime dataCriacao;//mostra quando a vaga abriu (data)

    @UpdateTimestamp
    private LocalDateTime dataAtualizacao;//mostra a última atualização que a vaga teve

    public Vaga(VagaRequestDTO data, Usuario anunciante) {
        this.titulo = data.titulo();
        this.empresa = data.empresa();
        this.descricao = data.descricao();
        this.salario = data.salario();
        this.localizacao = data.localizacao();
        this.anunciante = anunciante;
    }
}
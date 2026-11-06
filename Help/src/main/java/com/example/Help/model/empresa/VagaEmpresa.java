package com.example.Help.model.empresa;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "vagas_empresa")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VagaEmpresa {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    private String cargo;

    @Column(name = "data_publicacao")
    private LocalDate dataPublicacao;

    @Column(name = "experiencia_minima")
    private Integer experienciaMinima;

    @Column(name = "salario_base")
    private Double salarioBase;

    private String tipoExperiencia;
    private String modelo;
    private String tipo;
    private String status;
    private String senioridade;
    private String localizacao;
    private String salario;
    private String prioridade;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    // nullable durante a migração: vagas antigas continuam legíveis, mas novas vagas sempre recebem dona.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    @JsonIgnore
    private Empresa empresa;

    @ElementCollection
    @CollectionTable(name = "vaga_skills", joinColumns = @JoinColumn(name = "vaga_id"))
    @Column(name = "skill")
    private List<String> skillsExigidas;

    @ElementCollection
    @CollectionTable(name = "vaga_inscritos", joinColumns = @JoinColumn(name = "vaga_id"))
    @Column(name = "inscrito_id")
    private List<UUID> inscritosIds; // IDs dos talentos inscritos

    @JsonProperty("empresaNome")
    public String getEmpresaNome() {
        return empresa == null ? null : empresa.getCorporateName();
    }
}

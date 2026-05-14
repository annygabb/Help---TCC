package com.example.Help.model.vaga;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
public class VagaEmpresa {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;
    private String cargo;
    private LocalDate dataPublicacao;
    private Integer experienciaMinima;

    @ElementCollection
    private List<String> skillsExigidas;

    @ElementCollection
    private List<UUID> inscritosIds; //IDs dos talentos inscritos
}
package com.example.Help.model.perfil;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "perfil_experiencias")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Experiencia {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String empresa;
    private String cargo;
    private String tipoEmprego;
    private String modeloTrabalho;

    @Column(columnDefinition = "TEXT")
    private String atividades;
    private boolean trabalhaAtualmente;
    private String dataInicio; //string para facilitar a integração com o input date do React
    private String dataFim;
}
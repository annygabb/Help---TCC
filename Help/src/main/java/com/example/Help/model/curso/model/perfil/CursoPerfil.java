package com.example.Help.model.perfil;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "perfil_cursos")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class CursoPerfil {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String nomeCurso;
    private String instituicao;
    private String cargaHoraria;
    private String tempoDuracao;
    private String certificadoUrl;
}
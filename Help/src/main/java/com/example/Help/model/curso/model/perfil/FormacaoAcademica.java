package com.example.Help.model.perfil;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "perfil_cursos")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class FormacaoAcademica {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String nomeCurso;
    private String instituicao;
    private String cargaHoraria;
    private String tempoDuracao;
    private String certificadoUrl;//salva o arquivo pdf ou imagem que é gerado pelo arquivoservice
}
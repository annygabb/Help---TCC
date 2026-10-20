package com.example.Help.model.admin;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_audit_logs")
@Getter
@NoArgsConstructor
public class AdminAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "alvo_tipo", nullable = false, length = 20)
    private String alvoTipo;

    @Column(name = "alvo_id", nullable = false)
    private UUID alvoId;

    @Column(name = "admin_id", nullable = false)
    private UUID adminId;

    @Column(name = "admin_nome", nullable = false)
    private String adminNome;

    @Column(nullable = false, length = 80)
    private String acao;

    @Column(length = 500)
    private String resumo;

    @CreationTimestamp
    @Column(name = "data_hora", nullable = false, updatable = false)
    private LocalDateTime dataHora;

    public AdminAuditLog(
            String alvoTipo,
            UUID alvoId,
            UUID adminId,
            String adminNome,
            String acao,
            String resumo
    ) {
        this.alvoTipo = alvoTipo;
        this.alvoId = alvoId;
        this.adminId = adminId;
        this.adminNome = adminNome;
        this.acao = acao;
        this.resumo = resumo;
    }
}

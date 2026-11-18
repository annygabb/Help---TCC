package com.example.Help.model.curso;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "matriculas_gratuitas", uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "curso_codigo"}))
public class MatriculaGratuita {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "usuario_id", nullable = false)
    private UUID usuarioId;
    @Column(name = "curso_codigo", nullable = false, length = 80)
    private String cursoCodigo;
    @Column(nullable = false)
    private boolean confirmada;
    @Column(name = "codigo_hash", length = 64)
    private String codigoHash;
    @Column(name = "expira_em")
    private LocalDateTime expiraEm;
    @Column(name = "solicitado_em")
    private LocalDateTime solicitadoEm;
    @Column(nullable = false)
    private int tentativas;

    public MatriculaGratuita() { }
    public MatriculaGratuita(UUID usuarioId, String cursoCodigo) { this.usuarioId = usuarioId; this.cursoCodigo = cursoCodigo; }
    public String getCursoCodigo() { return cursoCodigo; }
    public boolean isConfirmada() { return confirmada; }
    public void setConfirmada(boolean confirmada) { this.confirmada = confirmada; }
    public String getCodigoHash() { return codigoHash; }
    public void setCodigoHash(String codigoHash) { this.codigoHash = codigoHash; }
    public LocalDateTime getExpiraEm() { return expiraEm; }
    public void setExpiraEm(LocalDateTime expiraEm) { this.expiraEm = expiraEm; }
    public LocalDateTime getSolicitadoEm() { return solicitadoEm; }
    public void setSolicitadoEm(LocalDateTime solicitadoEm) { this.solicitadoEm = solicitadoEm; }
    public int getTentativas() { return tentativas; }
    public void setTentativas(int tentativas) { this.tentativas = tentativas; }
}

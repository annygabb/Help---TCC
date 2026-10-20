package com.example.Help.model.admin;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class AdminDtos {
    private AdminDtos() {}

    public record Resumo(
            long totalContas,
            long candidatos,
            long administradores,
            long empresas,
            long totalEmpresas,
            long contasInativas,
            long empresasInativas
    ) {}

    public record ContaLista(
            UUID id,
            String nome,
            String email,
            String tipoConta,
            boolean ativo,
            LocalDateTime criadoEm
    ) {}

    public record ContaDetalhe(
            UUID id,
            String nome,
            String email,
            String tipoConta,
            boolean ativo,
            String cargo,
            String localizacao,
            String cpfMascarado,
            LocalDateTime criadoEm,
            long seguidores,
            long seguindo,
            List<Historico> historico
    ) {}

    public record EmpresaLista(
            UUID id,
            String razaoSocial,
            String cnpj,
            String email,
            boolean ativo,
            LocalDateTime criadoEm
    ) {}

    public record EmpresaDetalhe(
            UUID id,
            String razaoSocial,
            String cnpj,
            String email,
            boolean ativo,
            LocalDateTime criadoEm,
            List<Historico> historico
    ) {}

    public record Historico(
            UUID id,
            String acao,
            String adminNome,
            LocalDateTime dataHora,
            String resumo
    ) {}

    public record AlterarStatus(boolean ativo, String motivo) {}
}

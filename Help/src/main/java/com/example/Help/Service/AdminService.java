package com.example.Help.Service;

import com.example.Help.model.admin.AdminAuditLog;
import com.example.Help.model.admin.AdminAuditRepository;
import com.example.Help.model.admin.AdminDtos;
import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.seguidor.SeguidorRepository;
import com.example.Help.model.usuario.TipoConta;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final SeguidorRepository seguidorRepository;
    private final AdminAuditRepository auditRepository;

    public AdminService(
            UsuarioRepository usuarioRepository,
            EmpresaRepository empresaRepository,
            SeguidorRepository seguidorRepository,
            AdminAuditRepository auditRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.empresaRepository = empresaRepository;
        this.seguidorRepository = seguidorRepository;
        this.auditRepository = auditRepository;
    }

    public AdminDtos.Resumo resumo() {
        List<Usuario> contas = usuarioRepository.findAll();
        List<Empresa> empresas = empresaRepository.findAll();
        long candidatos = contas.stream().filter(u -> u.getTipoConta() == TipoConta.CANDIDATO).count();
        long administradores = contas.stream().filter(u -> u.getTipoConta() == TipoConta.ADMIN).count();
        long contasInativas = contas.stream().filter(u -> !u.isAtivo()).count();
        long empresasInativas = empresas.stream().filter(e -> !e.isAtivo()).count();
        return new AdminDtos.Resumo(
                contas.size(), candidatos, administradores, empresas.size(), empresas.size(),
                contasInativas, empresasInativas
        );
    }

    public Page<AdminDtos.ContaLista> listarContas(
            String busca,
            String tipo,
            String status,
            int page,
            int size
    ) {
        String termo = normalizar(busca);
        List<AdminDtos.ContaLista> itens = usuarioRepository.findAll().stream()
                .filter(u -> termo.isBlank()
                        || normalizar(u.getName()).contains(termo)
                        || normalizar(u.getEmail()).contains(termo))
                .filter(u -> tipo == null || tipo.isBlank() || u.getTipoConta().name().equalsIgnoreCase(tipo))
                .filter(u -> correspondeStatus(u.isAtivo(), status))
                .sorted(Comparator.comparing(Usuario::getCriadoEm,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toContaLista)
                .toList();
        return paginar(itens, page, size);
    }

    public AdminDtos.ContaDetalhe buscarConta(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada."));
        return new AdminDtos.ContaDetalhe(
                usuario.getId(), usuario.getName(), usuario.getEmail(), usuario.getTipoConta().name(),
                usuario.isAtivo(), usuario.getJobRole(), usuario.getLocation(), mascararCpf(usuario.getCpf()),
                usuario.getCriadoEm(), seguidorRepository.countBySeguidoUsuario_Id(id),
                seguidorRepository.countBySeguidorUsuario_Id(id), historico("USUARIO", id)
        );
    }

    @Transactional
    public AdminDtos.ContaDetalhe alterarStatusConta(
            UUID id,
            AdminDtos.AlterarStatus dados,
            Authentication authentication
    ) {
        Usuario admin = admin(authentication);
        Usuario alvo = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conta não encontrada."));

        if (!dados.ativo() && admin.getId().equals(alvo.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Você não pode desativar a própria conta.");
        }
        if (!dados.ativo() && alvo.getTipoConta() == TipoConta.ADMIN && contarAdminsAtivos() <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O sistema precisa manter ao menos um administrador ativo.");
        }

        alvo.setAtivo(dados.ativo());
        alvo.setMotivoStatus(limparMotivo(dados.motivo()));
        usuarioRepository.save(alvo);
        registrar("USUARIO", id, admin, dados.ativo() ? "CONTA_REATIVADA" : "CONTA_DESATIVADA", dados.motivo());
        return buscarConta(id);
    }

    public Page<AdminDtos.EmpresaLista> listarEmpresas(
            String busca,
            String status,
            int page,
            int size
    ) {
        String termo = normalizar(busca);
        List<AdminDtos.EmpresaLista> itens = empresaRepository.findAll().stream()
                .filter(e -> termo.isBlank()
                        || normalizar(e.getCorporateName()).contains(termo)
                        || normalizar(e.getEmail()).contains(termo)
                        || normalizar(e.getCnpj()).contains(termo))
                .filter(e -> correspondeStatus(e.isAtivo(), status))
                .sorted(Comparator.comparing(Empresa::getCriadoEm,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toEmpresaLista)
                .toList();
        return paginar(itens, page, size);
    }

    public AdminDtos.EmpresaDetalhe buscarEmpresa(UUID id) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa não encontrada."));
        return new AdminDtos.EmpresaDetalhe(
                empresa.getId(), empresa.getCorporateName(), empresa.getCnpj(), empresa.getEmail(),
                empresa.isAtivo(), empresa.getCriadoEm(), historico("EMPRESA", id)
        );
    }

    @Transactional
    public AdminDtos.EmpresaDetalhe alterarStatusEmpresa(
            UUID id,
            AdminDtos.AlterarStatus dados,
            Authentication authentication
    ) {
        Usuario admin = admin(authentication);
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa não encontrada."));
        empresa.setAtivo(dados.ativo());
        empresa.setMotivoStatus(limparMotivo(dados.motivo()));
        empresaRepository.save(empresa);
        registrar("EMPRESA", id, admin, dados.ativo() ? "EMPRESA_REATIVADA" : "EMPRESA_DESATIVADA", dados.motivo());
        return buscarEmpresa(id);
    }

    private Usuario admin(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Usuario usuario
                && usuario.getTipoConta() == TipoConta.ADMIN) {
            return usuario;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso administrativo necessário.");
    }

    private long contarAdminsAtivos() {
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getTipoConta() == TipoConta.ADMIN && u.isAtivo())
                .count();
    }

    private void registrar(String tipo, UUID alvoId, Usuario admin, String acao, String motivo) {
        String resumo = limparMotivo(motivo);
        if (resumo == null) resumo = acao.endsWith("REATIVADA") ? "Acesso reativado." : "Acesso desativado.";
        auditRepository.save(new AdminAuditLog(
                tipo, alvoId, admin.getId(), admin.getName(), acao, resumo
        ));
    }

    private List<AdminDtos.Historico> historico(String tipo, UUID id) {
        return auditRepository.findByAlvoTipoAndAlvoIdOrderByDataHoraDesc(tipo, id).stream()
                .map(log -> new AdminDtos.Historico(
                        log.getId(), log.getAcao(), log.getAdminNome(), log.getDataHora(), log.getResumo()
                ))
                .toList();
    }

    private AdminDtos.ContaLista toContaLista(Usuario u) {
        return new AdminDtos.ContaLista(
                u.getId(), u.getName(), u.getEmail(), u.getTipoConta().name(), u.isAtivo(), u.getCriadoEm()
        );
    }

    private AdminDtos.EmpresaLista toEmpresaLista(Empresa e) {
        return new AdminDtos.EmpresaLista(
                e.getId(), e.getCorporateName(), e.getCnpj(), e.getEmail(), e.isAtivo(), e.getCriadoEm()
        );
    }

    private boolean correspondeStatus(boolean ativo, String status) {
        if (status == null || status.isBlank()) return true;
        if (status.equalsIgnoreCase("ativo")) return ativo;
        if (status.equalsIgnoreCase("inativo")) return !ativo;
        return true;
    }

    private String normalizar(String valor) {
        return valor == null ? "" : valor.trim().toLowerCase(Locale.ROOT);
    }

    private String limparMotivo(String motivo) {
        if (motivo == null || motivo.isBlank()) return null;
        String limpo = motivo.trim();
        return limpo.length() <= 500 ? limpo : limpo.substring(0, 500);
    }

    private String mascararCpf(String cpf) {
        if (cpf == null || cpf.isBlank()) return null;
        String numeros = cpf.replaceAll("\\D", "");
        if (numeros.length() != 11) return "***.***.***-**";
        return "***." + numeros.substring(3, 6) + "." + numeros.substring(6, 9) + "-**";
    }

    private <T> Page<T> paginar(List<T> itens, int page, int size) {
        int pagina = Math.max(page, 0);
        int tamanho = Math.min(Math.max(size, 1), 100);
        int inicio = Math.min(pagina * tamanho, itens.size());
        int fim = Math.min(inicio + tamanho, itens.size());
        return new PageImpl<>(itens.subList(inicio, fim), PageRequest.of(pagina, tamanho), itens.size());
    }
}

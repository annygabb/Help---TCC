package com.example.Help.unidade;

import com.example.Help.Service.AdminService;
import com.example.Help.model.admin.AdminAuditLog;
import com.example.Help.model.admin.AdminAuditRepository;
import com.example.Help.model.admin.AdminDtos;
import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.seguidor.SeguidorRepository;
import com.example.Help.model.usuario.TipoConta;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@DisplayName("Regras do painel administrativo (AdminService)")
class AdminServiceTest {

    private UsuarioRepository usuarios;
    private EmpresaRepository empresas;
    private AdminAuditRepository auditoria;
    private AdminService service;
    private Usuario admin;

    @BeforeEach
    void configurar() {
        usuarios = mock(UsuarioRepository.class);
        empresas = mock(EmpresaRepository.class);
        auditoria = mock(AdminAuditRepository.class);
        service = new AdminService(usuarios, empresas, mock(SeguidorRepository.class), auditoria);
        admin = usuario("Admin Geral", "admin@help.test", TipoConta.ADMIN, true, LocalDateTime.now().minusDays(30));
    }

    private Usuario usuario(String nome, String email, TipoConta tipo, boolean ativo, LocalDateTime criadoEm) {
        Usuario usuario = new Usuario();
        usuario.setId(UUID.randomUUID());
        usuario.setName(nome);
        usuario.setEmail(email);
        usuario.setTipoConta(tipo);
        usuario.setAtivo(ativo);
        usuario.setCriadoEm(criadoEm);
        return usuario;
    }

    private Empresa empresa(String nome, String cnpj, boolean ativa) {
        Empresa empresa = new Empresa();
        empresa.setId(UUID.randomUUID());
        empresa.setCorporateName(nome);
        empresa.setEmail(nome.toLowerCase().replace(" ", "") + "@empresa.test");
        empresa.setCnpj(cnpj);
        empresa.setAtivo(ativa);
        return empresa;
    }

    private Authentication como(Usuario usuario) {
        return new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
    }

    private HttpStatus statusDe(Throwable erro) {
        return HttpStatus.valueOf(((ResponseStatusException) erro).getStatusCode().value());
    }

    @Test
    @DisplayName("CT-UN-ADM-01: resumo conta candidatos, administradores, empresas e inativos")
    void resumoContaCadaGrupo() {
        when(usuarios.findAll()).thenReturn(List.of(
                admin,
                usuario("Ana", "ana@help.test", TipoConta.CANDIDATO, true, null),
                usuario("Bia", "bia@help.test", TipoConta.CANDIDATO, false, null)));
        when(empresas.findAll()).thenReturn(List.of(empresa("Alfa", "11222333000181", true), empresa("Beta", "11444777000161", false)));

        AdminDtos.Resumo resumo = service.resumo();

        assertThat(resumo.totalContas()).isEqualTo(3);
        assertThat(resumo.candidatos()).isEqualTo(2);
        assertThat(resumo.administradores()).isEqualTo(1);
        assertThat(resumo.totalEmpresas()).isEqualTo(2);
        assertThat(resumo.contasInativas()).isEqualTo(1);
        assertThat(resumo.empresasInativas()).isEqualTo(1);
    }

    @Test
    @DisplayName("CT-UN-ADM-02: página negativa vira 0 e tamanho 0 vira 1")
    void paginaETamanhoSaoCorrigidos() {
        when(usuarios.findAll()).thenReturn(List.of(admin, usuario("Ana", "ana@help.test", TipoConta.CANDIDATO, true, null)));

        Page<AdminDtos.ContaLista> pagina = service.listarContas("", "", "", -3, 0);

        assertThat(pagina.getNumber()).isZero();
        assertThat(pagina.getSize()).isEqualTo(1);
        assertThat(pagina.getContent()).hasSize(1);
        assertThat(pagina.getTotalElements()).isEqualTo(2);
    }

    @Test
    @DisplayName("CT-UN-ADM-03: tamanho de página acima de 100 é limitado a 100")
    void tamanhoDePaginaLimitado() {
        when(usuarios.findAll()).thenReturn(List.of(admin));

        assertThat(service.listarContas("", "", "", 0, 500).getSize()).isEqualTo(100);
    }

    @Test
    @DisplayName("CT-UN-ADM-04: página além do fim devolve lista vazia sem erro")
    void paginaAlemDoFimFicaVazia() {
        when(usuarios.findAll()).thenReturn(List.of(admin));

        Page<AdminDtos.ContaLista> pagina = service.listarContas("", "", "", 7, 10);

        assertThat(pagina.getContent()).isEmpty();
        assertThat(pagina.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("CT-UN-ADM-05: a busca ignora maiúsculas e espaços nas pontas")
    void buscaIgnoraMaiusculasEEspacos() {
        when(usuarios.findAll()).thenReturn(List.of(admin, usuario("Ana Souza", "ana@help.test", TipoConta.CANDIDATO, true, null)));

        Page<AdminDtos.ContaLista> pagina = service.listarContas("  ANA ", "", "", 0, 10);

        assertThat(pagina.getContent()).extracting(AdminDtos.ContaLista::nome).containsExactly("Ana Souza");
    }

    @Test
    @DisplayName("CT-UN-ADM-06: o filtro de tipo aceita 'admin' em minúsculas")
    void filtroDeTipoSemDiferenciarMaiusculas() {
        when(usuarios.findAll()).thenReturn(List.of(admin, usuario("Ana", "ana@help.test", TipoConta.CANDIDATO, true, null)));

        assertThat(service.listarContas("", "admin", "", 0, 10).getContent())
                .extracting(AdminDtos.ContaLista::tipoConta).containsExactly("ADMIN");
    }

    @Test
    @DisplayName("CT-UN-ADM-07: o filtro 'inativo' traz só contas desativadas")
    void filtroDeStatusInativo() {
        when(usuarios.findAll()).thenReturn(List.of(admin, usuario("Bia", "bia@help.test", TipoConta.CANDIDATO, false, null)));

        assertThat(service.listarContas("", "", "INATIVO", 0, 10).getContent())
                .extracting(AdminDtos.ContaLista::nome).containsExactly("Bia");
    }

    @Test
    @DisplayName("CT-UN-ADM-08: status desconhecido não filtra nada")
    void statusDesconhecidoNaoFiltra() {
        when(usuarios.findAll()).thenReturn(List.of(admin, usuario("Bia", "bia@help.test", TipoConta.CANDIDATO, false, null)));

        assertThat(service.listarContas("", "", "qualquer", 0, 10).getContent()).hasSize(2);
    }

    @Test
    @DisplayName("CT-UN-ADM-09: lista da conta mais nova para a mais antiga, sem data por último")
    void ordenaDaMaisNovaParaAMaisAntiga() {
        Usuario antiga = usuario("Antiga", "antiga@help.test", TipoConta.CANDIDATO, true, LocalDateTime.now().minusDays(5));
        Usuario nova = usuario("Nova", "nova@help.test", TipoConta.CANDIDATO, true, LocalDateTime.now());
        Usuario semData = usuario("Sem Data", "semdata@help.test", TipoConta.CANDIDATO, true, null);
        when(usuarios.findAll()).thenReturn(List.of(semData, antiga, nova));

        assertThat(service.listarContas("", "", "", 0, 10).getContent())
                .extracting(AdminDtos.ContaLista::nome).containsExactly("Nova", "Antiga", "Sem Data");
    }

    @Test
    @DisplayName("CT-UN-ADM-10: o administrador não consegue desativar a própria conta")
    void naoDesativaAPropriaConta() {
        when(usuarios.findById(admin.getId())).thenReturn(Optional.of(admin));

        assertThatThrownBy(() -> service.alterarStatusConta(admin.getId(), new AdminDtos.AlterarStatus(false, null), como(admin)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Você não pode desativar a própria conta.")
                .satisfies(erro -> assertThat(statusDe(erro)).isEqualTo(HttpStatus.BAD_REQUEST));
        assertThat(admin.isAtivo()).isTrue();
    }

    @Test
    @DisplayName("CT-UN-ADM-11: o último administrador ativo não pode ser desativado")
    void ultimoAdminAtivoNaoPodeSerDesativado() {
        Usuario outroAdmin = usuario("Outra Admin", "outra@help.test", TipoConta.ADMIN, true, null);
        when(usuarios.findById(outroAdmin.getId())).thenReturn(Optional.of(outroAdmin));
        when(usuarios.findAll()).thenReturn(List.of(outroAdmin));

        assertThatThrownBy(() -> service.alterarStatusConta(outroAdmin.getId(), new AdminDtos.AlterarStatus(false, null), como(admin)))
                .hasMessageContaining("ao menos um administrador ativo");
        verify(usuarios, never()).save(any());
    }

    @Test
    @DisplayName("CT-UN-ADM-12: desativar grava status, motivo aparado e registro de auditoria")
    void desativarGravaMotivoEAuditoria() {
        Usuario alvo = usuario("Ana", "ana@help.test", TipoConta.CANDIDATO, true, null);
        when(usuarios.findById(alvo.getId())).thenReturn(Optional.of(alvo));

        service.alterarStatusConta(alvo.getId(), new AdminDtos.AlterarStatus(false, "  Spam repetido  "), como(admin));

        assertThat(alvo.isAtivo()).isFalse();
        assertThat(alvo.getMotivoStatus()).isEqualTo("Spam repetido");
        ArgumentCaptor<AdminAuditLog> log = ArgumentCaptor.forClass(AdminAuditLog.class);
        verify(auditoria).save(log.capture());
        assertThat(log.getValue().getAcao()).isEqualTo("CONTA_DESATIVADA");
        assertThat(log.getValue().getResumo()).isEqualTo("Spam repetido");
        assertThat(log.getValue().getAdminNome()).isEqualTo("Admin Geral");
        assertThat(log.getValue().getAlvoTipo()).isEqualTo("USUARIO");
        assertThat(log.getValue().getAlvoId()).isEqualTo(alvo.getId());
    }

    @Test
    @DisplayName("CT-UN-ADM-13: motivo com mais de 500 caracteres é cortado em 500")
    void motivoLongoEhCortado() {
        Usuario alvo = usuario("Ana", "ana@help.test", TipoConta.CANDIDATO, true, null);
        when(usuarios.findById(alvo.getId())).thenReturn(Optional.of(alvo));

        service.alterarStatusConta(alvo.getId(), new AdminDtos.AlterarStatus(false, "x".repeat(600)), como(admin));

        assertThat(alvo.getMotivoStatus()).hasSize(500);
    }

    @Test
    @DisplayName("CT-UN-ADM-14: reativar sem motivo registra 'Acesso reativado.'")
    void reativarSemMotivoUsaTextoPadrao() {
        Usuario alvo = usuario("Ana", "ana@help.test", TipoConta.CANDIDATO, false, null);
        when(usuarios.findById(alvo.getId())).thenReturn(Optional.of(alvo));

        service.alterarStatusConta(alvo.getId(), new AdminDtos.AlterarStatus(true, "   "), como(admin));

        ArgumentCaptor<AdminAuditLog> log = ArgumentCaptor.forClass(AdminAuditLog.class);
        verify(auditoria).save(log.capture());
        assertThat(log.getValue().getAcao()).isEqualTo("CONTA_REATIVADA");
        assertThat(log.getValue().getResumo()).isEqualTo("Acesso reativado.");
        assertThat(alvo.getMotivoStatus()).isNull();
    }

    @Test
    @DisplayName("CT-UN-ADM-15: desativar sem motivo registra 'Acesso desativado.'")
    void desativarSemMotivoUsaTextoPadrao() {
        Usuario alvo = usuario("Ana", "ana@help.test", TipoConta.CANDIDATO, true, null);
        when(usuarios.findById(alvo.getId())).thenReturn(Optional.of(alvo));

        service.alterarStatusConta(alvo.getId(), new AdminDtos.AlterarStatus(false, null), como(admin));

        ArgumentCaptor<AdminAuditLog> log = ArgumentCaptor.forClass(AdminAuditLog.class);
        verify(auditoria).save(log.capture());
        assertThat(log.getValue().getResumo()).isEqualTo("Acesso desativado.");
    }

    @Test
    @DisplayName("CT-UN-ADM-16: conta comum não usa as ações administrativas (403)")
    void contaComumRecebe403() {
        Usuario comum = usuario("Ana", "ana@help.test", TipoConta.CANDIDATO, true, null);

        assertThatThrownBy(() -> service.alterarStatusConta(UUID.randomUUID(), new AdminDtos.AlterarStatus(false, null), como(comum)))
                .satisfies(erro -> assertThat(statusDe(erro)).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    @DisplayName("CT-UN-ADM-17: o detalhe mostra só os 6 dígitos do meio do CPF")
    void cpfMascarado() {
        Usuario alvo = usuario("Ana", "ana@help.test", TipoConta.CANDIDATO, true, null);
        alvo.setCpf("52998224725");
        when(usuarios.findById(alvo.getId())).thenReturn(Optional.of(alvo));

        assertThat(service.buscarConta(alvo.getId()).cpfMascarado()).isEqualTo("***.982.247-**");
    }

    @Test
    @DisplayName("CT-UN-ADM-18: CPF fora do padrão aparece totalmente mascarado")
    void cpfForaDoPadraoTotalmenteMascarado() {
        Usuario alvo = usuario("Ana", "ana@help.test", TipoConta.CANDIDATO, true, null);
        alvo.setCpf("123");
        when(usuarios.findById(alvo.getId())).thenReturn(Optional.of(alvo));

        assertThat(service.buscarConta(alvo.getId()).cpfMascarado()).isEqualTo("***.***.***-**");
    }

    @Test
    @DisplayName("CT-UN-ADM-19: conta inexistente devolve 404 'Conta não encontrada.'")
    void contaInexistente404() {
        UUID id = UUID.randomUUID();
        when(usuarios.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarConta(id))
                .hasMessageContaining("Conta não encontrada.")
                .satisfies(erro -> assertThat(statusDe(erro)).isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    @DisplayName("CT-UN-ADM-20: desativar empresa registra auditoria do tipo EMPRESA")
    void desativarEmpresaRegistraAuditoria() {
        Empresa alvo = empresa("Alfa", "11222333000181", true);
        when(empresas.findById(alvo.getId())).thenReturn(Optional.of(alvo));

        service.alterarStatusEmpresa(alvo.getId(), new AdminDtos.AlterarStatus(false, "Fraude"), como(admin));

        assertThat(alvo.isAtivo()).isFalse();
        ArgumentCaptor<AdminAuditLog> log = ArgumentCaptor.forClass(AdminAuditLog.class);
        verify(auditoria).save(log.capture());
        assertThat(log.getValue().getAcao()).isEqualTo("EMPRESA_DESATIVADA");
        assertThat(log.getValue().getAlvoTipo()).isEqualTo("EMPRESA");
    }

    @Test
    @DisplayName("CT-UN-ADM-21: a busca de empresas encontra pelo CNPJ")
    void buscaDeEmpresaPorCnpj() {
        when(empresas.findAll()).thenReturn(List.of(empresa("Alfa", "11222333000181", true), empresa("Beta", "11444777000161", true)));

        assertThat(service.listarEmpresas("11222333", "", 0, 10).getContent())
                .extracting(AdminDtos.EmpresaLista::razaoSocial).containsExactly("Alfa");
    }
}

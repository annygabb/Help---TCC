package com.example.Help.integracao;

import com.example.Help.suporte.Documentos;
import com.example.Help.suporte.IntegracaoBase;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Integração: painel administrativo")
class AdminTest extends IntegracaoBase {

    private long numero(String json, String caminho) {
        Number valor = JsonPath.read(json, caminho);
        return valor.longValue();
    }

    @Test
    @DisplayName("CT-BE-ADM-01: o resumo soma as contas e empresas criadas")
    void resumoSomaContasCriadas() throws Exception {
        Conta admin = novoAdmin();
        String antes = getComo(admin, "/admin/resumo").andReturn().getResponse().getContentAsString();

        novoUsuario("Ana");
        novaEmpresa("Alfa");

        String depois = getComo(admin, "/admin/resumo").andReturn().getResponse().getContentAsString();
        assertThat(numero(depois, "$.candidatos") - numero(antes, "$.candidatos")).isEqualTo(1);
        assertThat(numero(depois, "$.totalEmpresas") - numero(antes, "$.totalEmpresas")).isEqualTo(1);
    }

    @Test
    @DisplayName("CT-BE-ADM-02: a busca de contas encontra pelo e-mail sem diferenciar maiúsculas")
    void buscaDeContasPorEmail() throws Exception {
        Conta admin = novoAdmin();
        Conta ana = novoUsuario("Ana");
        getComo(admin, "/admin/contas?busca=" + ana.email().toUpperCase())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].id", hasItem(ana.id())));
    }

    @Test
    @DisplayName("CT-BE-ADM-03: o tamanho de página pedido acima de 100 volta como 100")
    void tamanhoDePaginaLimitado() throws Exception {
        Conta admin = novoAdmin();
        getComo(admin, "/admin/contas?size=500").andExpect(jsonPath("$.size").value(100));
    }

    @Test
    @DisplayName("CT-BE-ADM-04: o detalhe da conta mascara o CPF")
    void detalheMascaraCpf() throws Exception {
        Conta admin = novoAdmin();
        Conta ana = novoUsuario("Ana");
        getComo(admin, "/admin/contas/" + ana.id())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cpfMascarado", matchesPattern("\\*\\*\\*\\.\\d{3}\\.\\d{3}-\\*\\*")));
    }

    @Test
    @DisplayName("CT-BE-ADM-05: o administrador não desativa a própria conta")
    void naoDesativaAPropriaConta() throws Exception {
        Conta admin = novoAdmin();
        patchComo(admin, "/admin/contas/" + admin.id() + "/status", "{\"ativo\":false}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Você não pode desativar a própria conta."));
    }

    @Test
    @DisplayName("CT-BE-ADM-06: desativar uma conta registra o motivo no histórico")
    void desativarRegistraHistorico() throws Exception {
        Conta admin = novoAdmin();
        Conta ana = novoUsuario("Ana");
        patchComo(admin, "/admin/contas/" + ana.id() + "/status", "{\"ativo\":false,\"motivo\":\"Spam\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo").value(false))
                .andExpect(jsonPath("$.historico[0].acao").value("CONTA_DESATIVADA"))
                .andExpect(jsonPath("$.historico[0].resumo").value("Spam"))
                .andExpect(jsonPath("$.historico[0].adminNome").value("Administradora"));
    }

    @Test
    @DisplayName("CT-BE-ADM-07: conta desativada perde o acesso na hora e não consegue entrar de novo")
    void contaDesativadaPerdeAcesso() throws Exception {
        Conta admin = novoAdmin();
        Conta ana = novoUsuario("Ana");
        patchComo(admin, "/admin/contas/" + ana.id() + "/status", "{\"ativo\":false}").andExpect(status().isOk());

        getComo(ana, "/auth/me").andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/usuarios/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(ana.email(), SENHA)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Conta desativada."));
    }

    @Test
    @DisplayName("CT-BE-ADM-08: reativar devolve o acesso")
    void reativarDevolveAcesso() throws Exception {
        Conta admin = novoAdmin();
        Conta ana = novoUsuario("Ana");
        patchComo(admin, "/admin/contas/" + ana.id() + "/status", "{\"ativo\":false}").andExpect(status().isOk());
        patchComo(admin, "/admin/contas/" + ana.id() + "/status", "{\"ativo\":true}")
                .andExpect(jsonPath("$.historico[0].acao").value("CONTA_REATIVADA"));

        loginUsuario(ana.email());
    }

    @Test
    @DisplayName("CT-BE-ADM-09: empresa desativada não consegue entrar")
    void empresaDesativadaNaoEntra() throws Exception {
        Conta admin = novoAdmin();
        String email = emailUnico("empresa");
        cadastrarEmpresa("Alfa", email, Documentos.novoCnpj());
        String id = JsonPath.read(getComo(admin, "/admin/empresas?busca=" + email).andReturn().getResponse().getContentAsString(),
                "$.content[0].id");

        patchComo(admin, "/admin/empresas/" + id + "/status", "{\"ativo\":false,\"motivo\":\"Fraude\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.historico[0].acao").value("EMPRESA_DESATIVADA"));

        mockMvc.perform(post("/api/empresas/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, SENHA)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("CT-BE-ADM-10: conta inexistente no painel devolve 404")
    void contaInexistente() throws Exception {
        Conta admin = novoAdmin();
        getComo(admin, "/admin/contas/" + UUID.randomUUID())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Conta não encontrada."));
    }

    @Test
    @DisplayName("CT-BE-ADM-11: o filtro de status 'inativo' só traz contas desativadas")
    void filtroDeInativos() throws Exception {
        Conta admin = novoAdmin();
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        patchComo(admin, "/admin/contas/" + ana.id() + "/status", "{\"ativo\":false}").andExpect(status().isOk());

        getComo(admin, "/admin/contas?status=inativo&size=100")
                .andExpect(jsonPath("$.content[*].id", hasItem(ana.id())))
                .andExpect(jsonPath("$.content[*].id", not(hasItem(bruno.id()))));
    }

    @Test
    @DisplayName("CT-BE-ADM-12: candidato comum não lista contas do painel")
    void candidatoNaoListaContas() throws Exception {
        Conta ana = novoUsuario("Ana");
        getComo(ana, "/admin/contas").andExpect(status().isForbidden());
    }
}

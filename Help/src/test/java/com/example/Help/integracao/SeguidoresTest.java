package com.example.Help.integracao;

import com.example.Help.suporte.IntegracaoBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Integração: seguir e deixar de seguir contas")
class SeguidoresTest extends IntegracaoBase {

    @Test
    @DisplayName("CT-BE-SGD-01: seguir uma pessoa cria a relação e avisa quem foi seguido")
    void seguirPessoaNotifica() throws Exception {
        Conta ana = novoUsuario("Ana Souza");
        Conta bruno = novoUsuario("Bruno");

        seguir(ana, bruno);

        getComo(ana, "/seguidores/status/USUARIO/" + bruno.id()).andExpect(jsonPath("$.seguindo").value(true));
        getComo(bruno, "/notificacoes")
                .andExpect(jsonPath("$[0].tipo").value("NOVO_SEGUIDOR"))
                .andExpect(jsonPath("$[0].origemNome").value("Ana Souza"))
                .andExpect(jsonPath("$[0].origemTipo").value("USUARIO"));
    }

    @Test
    @DisplayName("CT-BE-SGD-02: candidato segue empresa e a contagem da empresa sobe")
    void seguirEmpresaAtualizaContagem() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta empresa = novaEmpresa("Alfa");

        seguir(ana, empresa);

        getComo(ana, "/seguidores/contagem/EMPRESA/" + empresa.id())
                .andExpect(jsonPath("$.seguidores").value(1))
                .andExpect(jsonPath("$.seguindo").value(0));
    }

    @Test
    @DisplayName("CT-BE-SGD-03: empresa também pode seguir uma pessoa")
    void empresaSeguePessoa() throws Exception {
        Conta empresa = novaEmpresa("Alfa");
        Conta ana = novoUsuario("Ana");

        seguir(empresa, ana);

        getComo(empresa, "/seguidores/seguindo")
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(ana.id()))
                .andExpect(jsonPath("$[0].euSigoEle").value(true));
    }

    @Test
    @DisplayName("CT-BE-SGD-04: ninguém segue a si mesmo")
    void naoSegueASiMesmo() throws Exception {
        Conta ana = novoUsuario("Ana");
        postComo(ana, "/seguidores/seguir/USUARIO/" + ana.id(), "{}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Você não pode seguir a si mesmo."));
    }

    @Test
    @DisplayName("CT-BE-SGD-05: seguir duas vezes a mesma conta é recusado")
    void seguirDuasVezes() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        seguir(ana, bruno);

        postComo(ana, "/seguidores/seguir/USUARIO/" + bruno.id(), "{}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Você já está seguindo esta conta."));
    }

    @Test
    @DisplayName("CT-BE-SGD-06: deixar de seguir quem não segue é recusado")
    void deixarDeSeguirQuemNaoSegue() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        deleteComo(ana, "/seguidores/deixar-de-seguir/USUARIO/" + bruno.id())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Você não segue esta conta."));
    }

    @Test
    @DisplayName("CT-BE-SGD-07: deixar de seguir remove a relação")
    void deixarDeSeguir() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        seguir(ana, bruno);

        deleteComo(ana, "/seguidores/deixar-de-seguir/USUARIO/" + bruno.id()).andExpect(status().isOk());

        getComo(ana, "/seguidores/status/USUARIO/" + bruno.id()).andExpect(jsonPath("$.seguindo").value(false));
    }

    @Test
    @DisplayName("CT-BE-SGD-08: conta inexistente devolve 404")
    void contaInexistente() throws Exception {
        Conta ana = novoUsuario("Ana");
        postComo(ana, "/seguidores/seguir/USUARIO/" + UUID.randomUUID(), "{}")
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Usuário não encontrado."));
    }

    @Test
    @DisplayName("CT-BE-SGD-09: conta desativada não pode ser seguida (403)")
    void contaDesativadaNaoPodeSerSeguida() throws Exception {
        Conta admin = novoAdmin();
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        patchComo(admin, "/admin/contas/" + bruno.id() + "/status", "{\"ativo\":false}").andExpect(status().isOk());

        postComo(ana, "/seguidores/seguir/USUARIO/" + bruno.id(), "{}")
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Conta desativada."));
    }

    @Test
    @DisplayName("CT-BE-SGD-10: a lista de seguidores mostra se eu também sigo de volta")
    void listaDeSeguidoresMostraSeSigoDeVolta() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        seguir(ana, bruno);

        getComo(bruno, "/seguidores/meus-seguidores")
                .andExpect(jsonPath("$[0].id").value(ana.id()))
                .andExpect(jsonPath("$[0].euSigoEle").value(false));
        seguir(bruno, ana);
        getComo(bruno, "/seguidores/meus-seguidores").andExpect(jsonPath("$[0].euSigoEle").value(true));
    }

    @Test
    @DisplayName("CT-BE-SGD-11: tipo de conta inválido na URL é recusado")
    void tipoDeContaInvalido() throws Exception {
        Conta ana = novoUsuario("Ana");
        postComo(ana, "/seguidores/seguir/ADMIN/" + UUID.randomUUID(), "{}")
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("CT-BE-SGD-12: contagem exige login")
    void contagemExigeLogin() throws Exception {
        mockMvc.perform(get("/seguidores/contagem/USUARIO/" + UUID.randomUUID()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CT-BE-SGD-13: rota legada /seguidores/seguir/{id} continua funcionando para pessoas")
    void rotaLegadaContinuaFuncionando() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        postComo(ana, "/seguidores/seguir/" + bruno.id(), "{}").andExpect(status().isCreated());
        getComo(ana, "/seguidores/seguindo").andExpect(jsonPath("$[*].id", hasItem(bruno.id())));
    }
}

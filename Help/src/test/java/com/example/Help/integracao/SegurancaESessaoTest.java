package com.example.Help.integracao;

import com.example.Help.suporte.Documentos;
import com.example.Help.suporte.IntegracaoBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Integração: segurança, login e sessão única")
class SegurancaESessaoTest extends IntegracaoBase {

    @Test
    @DisplayName("CT-BE-SEG-01: rota protegida sem token é recusada (403)")
    void rotaProtegidaSemToken() throws Exception {
        mockMvc.perform(get("/perfis/me")).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CT-BE-SEG-02: token adulterado devolve 401 com mensagem em JSON")
    void tokenAdulterado() throws Exception {
        mockMvc.perform(get("/auth/me").header("Authorization", "Bearer abc.def.ghi"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Token inválido ou expirado."));
    }

    @Test
    @DisplayName("CT-BE-SEG-03: cabeçalho sem o prefixo Bearer é ignorado e a rota continua protegida")
    void cabecalhoSemBearer() throws Exception {
        Conta ana = novoUsuario("Ana");
        mockMvc.perform(get("/perfis/me").header("Authorization", ana.token()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CT-BE-SEG-04: novo login da mesma conta derruba o token anterior")
    void novoLoginDerrubaTokenAnterior() throws Exception {
        Conta ana = novoUsuario("Ana");
        String tokenNovo = loginUsuario(ana.email());

        mockMvc.perform(get("/auth/me").header("Authorization", ana.bearer()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Sessão expirada ou substituída por outro login."));
        mockMvc.perform(get("/auth/me").header("Authorization", "Bearer " + tokenNovo))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("CT-BE-SEG-05: login com token velho no cabeçalho ainda funciona")
    void loginComTokenVelhoNoCabecalho() throws Exception {
        Conta ana = novoUsuario("Ana");
        mockMvc.perform(post("/api/usuarios/login")
                        .header("Authorization", "Bearer token-quebrado")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(ana.email(), SENHA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("CT-BE-SEG-06: entrar em outra conta no mesmo navegador encerra a conta anterior")
    void trocarDeContaEncerraAAnterior() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");

        mockMvc.perform(post("/api/usuarios/login")
                        .header("Authorization", ana.bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(bruno.email(), SENHA)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/auth/me").header("Authorization", ana.bearer()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CT-BE-SEG-07: senha errada e e-mail inexistente têm a mesma resposta (401)")
    void senhaErradaEEmailInexistenteRespondemIgual() throws Exception {
        Conta ana = novoUsuario("Ana");
        String corpoSenhaErrada = "{\"email\":\"%s\",\"password\":\"Errada123\"}".formatted(ana.email());
        String corpoEmailInexistente = "{\"email\":\"ninguem@help.test\",\"password\":\"Errada123\"}";

        for (String corpo : new String[]{corpoSenhaErrada, corpoEmailInexistente}) {
            mockMvc.perform(post("/api/usuarios/login").contentType(MediaType.APPLICATION_JSON).content(corpo))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.error").value("E-mail ou senha inválidos."));
        }
    }

    @Test
    @DisplayName("CT-BE-SEG-08: credencial de empresa não entra pelo login de candidato")
    void empresaNaoEntraNoLoginDeCandidato() throws Exception {
        String email = emailUnico("empresa");
        cadastrarEmpresa("Empresa Alfa", email, Documentos.novoCnpj());

        mockMvc.perform(post("/api/usuarios/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, SENHA)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CT-BE-SEG-09: a resposta do login não traz senha nem hash")
    void respostaDoLoginSemSenha() throws Exception {
        Conta ana = novoUsuario("Ana");
        mockMvc.perform(post("/api/usuarios/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(ana.email(), SENHA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.senha").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(content().string(not(containsString("$2a$"))));
    }

    @Test
    @DisplayName("CT-BE-SEG-10: candidato não acessa rotas exclusivas de empresa")
    void candidatoNaoAcessaRotasDeEmpresa() throws Exception {
        Conta ana = novoUsuario("Ana");
        getComo(ana, "/api/vagas/minhas").andExpect(status().isForbidden());
        getComo(ana, "/empresas/me").andExpect(status().isForbidden());
        getComo(ana, "/api/vagas/talentos").andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CT-BE-SEG-11: empresa não acessa o painel administrativo")
    void empresaNaoAcessaPainelAdmin() throws Exception {
        Conta empresa = novaEmpresa("Empresa Alfa");
        getComo(empresa, "/admin/resumo").andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CT-BE-SEG-12: CORS libera a origem configurada e barra uma origem desconhecida")
    void corsLiberaOrigemConfigurada() throws Exception {
        mockMvc.perform(options("/api/usuarios/login")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));

        mockMvc.perform(options("/api/usuarios/login")
                        .header("Origin", "https://site-desconhecido.example")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CT-BE-SEG-13: /auth/me devolve a identidade de quem está logado")
    void authMeDevolveIdentidade() throws Exception {
        Conta ana = novoUsuario("Ana Souza");
        getComo(ana, "/auth/me")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ana.id()))
                .andExpect(jsonPath("$.nome").value("Ana Souza"))
                .andExpect(jsonPath("$.tipoConta").value("CANDIDATO"));
    }

    @Test
    @DisplayName("CT-BE-SEG-14: o e-mail configurado como admin já nasce ADMIN no cadastro")
    void emailAdminNasceAdmin() throws Exception {
        Conta admin = novoAdmin();
        getComo(admin, "/auth/me").andExpect(jsonPath("$.tipoConta").value("ADMIN"));
        getComo(admin, "/admin/resumo").andExpect(status().isOk());
    }
}

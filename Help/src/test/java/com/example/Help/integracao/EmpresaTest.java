package com.example.Help.integracao;

import com.example.Help.suporte.Documentos;
import com.example.Help.suporte.IntegracaoBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Integração: cadastro, login e perfil de empresa")
class EmpresaTest extends IntegracaoBase {

    private String corpoCadastro(String nome, String email, String senha, String cnpj) {
        String campoSenha = senha == null ? "" : ",\"password\":\"" + senha + "\"";
        return "{\"corporateName\":\"%s\",\"email\":\"%s\",\"cnpj\":\"%s\"%s}".formatted(nome, email, cnpj, campoSenha);
    }

    @Test
    @DisplayName("CT-BE-EMP-01: CNPJ com máscara é aceito e guardado só com dígitos")
    void cnpjComMascaraGuardaSoDigitos() throws Exception {
        String email = emailUnico("alfa");
        mockMvc.perform(post("/api/empresas/cadastro").contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCadastro("Alfa", email, SENHA, "11.222.333/0001-81")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Empresa cadastrada com sucesso!"));

        String token = loginEmpresa(email);
        mockMvc.perform(get("/empresas/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.cnpj").value("11222333000181"));
    }

    @Test
    @DisplayName("CT-BE-EMP-02: e-mail já usado por um candidato não pode ser reutilizado pela empresa (409)")
    void emailDeCandidatoNaoServeParaEmpresa() throws Exception {
        Conta ana = novoUsuario("Ana");
        mockMvc.perform(post("/api/empresas/cadastro").contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCadastro("Alfa", ana.email(), SENHA, Documentos.novoCnpj())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.campo").value("email"));
    }

    @Test
    @DisplayName("CT-BE-EMP-03: CNPJ repetido é recusado com 409 no campo cnpj")
    void cnpjRepetido() throws Exception {
        String cnpj = Documentos.novoCnpj();
        cadastrarEmpresa("Alfa", emailUnico("alfa"), cnpj);
        mockMvc.perform(post("/api/empresas/cadastro").contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCadastro("Beta", emailUnico("beta"), SENHA, cnpj)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.campo").value("cnpj"));
    }

    @Test
    @DisplayName("CT-BE-EMP-04: senha com 7 caracteres é recusada (valor limite)")
    void senhaCurta() throws Exception {
        mockMvc.perform(post("/api/empresas/cadastro").contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCadastro("Alfa", emailUnico("alfa"), "Abc1234", Documentos.novoCnpj())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campo").value("senha"))
                .andExpect(jsonPath("$.mensagem").value("A senha deve ter no mínimo 8 caracteres."));
    }

    @Test
    @DisplayName("CT-BE-EMP-05: cadastro sem senha é recusado")
    void semSenha() throws Exception {
        mockMvc.perform(post("/api/empresas/cadastro").contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCadastro("Alfa", emailUnico("alfa"), null, Documentos.novoCnpj())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("A senha é obrigatória."));
    }

    @Test
    @DisplayName("CT-BE-EMP-06: CNPJ com quantidade errada de dígitos é recusado no campo cnpj")
    void cnpjComFormatoInvalido() throws Exception {
        mockMvc.perform(post("/api/empresas/cadastro").contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCadastro("Alfa", emailUnico("alfa"), SENHA, "123")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campo").value("cnpj"));
    }

    @Test
    @DisplayName("CT-BE-EMP-07: o campo legado 'senha' também é aceito no cadastro")
    void campoLegadoSenha() throws Exception {
        String email = emailUnico("legado");
        mockMvc.perform(post("/api/empresas/cadastro").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"corporateName\":\"Legado\",\"email\":\"%s\",\"senha\":\"%s\",\"cnpj\":\"%s\"}"
                                .formatted(email, SENHA, Documentos.novoCnpj())))
                .andExpect(status().isCreated());
        loginEmpresa(email);
    }

    @Test
    @DisplayName("CT-BE-EMP-08: o login da empresa aceita e-mail com maiúsculas e espaços")
    void loginComEmailNaoNormalizado() throws Exception {
        String email = emailUnico("alfa");
        cadastrarEmpresa("Alfa", email, Documentos.novoCnpj());
        mockMvc.perform(post("/api/empresas/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"  %s  \",\"password\":\"%s\"}".formatted(email.toUpperCase(), SENHA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("CT-BE-EMP-09: senha errada da empresa devolve 401")
    void senhaErradaDaEmpresa() throws Exception {
        String email = emailUnico("alfa");
        cadastrarEmpresa("Alfa", email, Documentos.novoCnpj());
        mockMvc.perform(post("/api/empresas/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"Errada123\"}".formatted(email)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CT-BE-EMP-10: credencial de candidato não entra pelo login de empresa")
    void candidatoNaoEntraNoLoginDeEmpresa() throws Exception {
        Conta ana = novoUsuario("Ana");
        mockMvc.perform(post("/api/empresas/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(ana.email(), SENHA)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CT-BE-EMP-11: atualizar o nome público tira espaços repetidos")
    void nomePublicoNormalizado() throws Exception {
        Conta empresa = novaEmpresa("Alfa");
        putComo(empresa, "/empresas/me", "{\"corporateName\":\"  Alfa   Tecnologia  \",\"fotoUrl\":null}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.razaoSocial").value("Alfa Tecnologia"));
    }

    @Test
    @DisplayName("CT-BE-EMP-12: nome público em branco é recusado")
    void nomePublicoEmBranco() throws Exception {
        Conta empresa = novaEmpresa("Alfa");
        putComo(empresa, "/empresas/me", "{\"corporateName\":\"   \"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campo").value("corporateName"));
    }

    @Test
    @DisplayName("CT-BE-EMP-13: mudar o nome avisa quem segue a empresa")
    void mudarNomeNotificaSeguidores() throws Exception {
        Conta empresa = novaEmpresa("Alfa");
        Conta ana = novoUsuario("Ana");
        seguir(ana, empresa);

        putComo(empresa, "/empresas/me", "{\"corporateName\":\"Alfa Nova\"}").andExpect(status().isOk());

        getComo(ana, "/notificacoes")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].tipo", hasItem("EMPRESA_ATUALIZADA")));
    }

    @Test
    @DisplayName("CT-BE-EMP-14: foto de 1 MB em base64 é salva e devolvida inteira")
    void fotoDeUmMegaEhSalva() throws Exception {
        Conta empresa = novaEmpresa("Alfa");
        String foto = "data:image/png;base64," + "A".repeat(1_000_000);
        putComo(empresa, "/empresas/me", "{\"corporateName\":\"Alfa\",\"fotoUrl\":\"%s\"}".formatted(foto))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fotoUrl").value(foto));
    }

    @Test
    @DisplayName("CT-BE-EMP-15: foto acima de 6 MB codificados é recusada com mensagem clara")
    void fotoAcimaDoLimite() throws Exception {
        Conta empresa = novaEmpresa("Alfa");
        String foto = "A".repeat(6_291_457);
        putComo(empresa, "/empresas/me", "{\"corporateName\":\"Alfa\",\"fotoUrl\":\"%s\"}".formatted(foto))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("A foto codificada excede o limite permitido."));
    }
}

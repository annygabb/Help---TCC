package com.example.Help.integracao;

import com.example.Help.suporte.IntegracaoBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Integração: vagas publicadas por empresas (/api/vagas)")
class VagasEmpresaTest extends IntegracaoBase {

    private static final String VAGA = """
            {"cargo":"Desenvolvedor Java","skillsExigidas":["Java","Spring"],"experienciaMinima":2,"salarioBase":8000}
            """;

    @Test
    @DisplayName("CT-BE-VAG-01: a lista de vagas é pública")
    void listaPublica() throws Exception {
        mockMvc.perform(get("/api/vagas")).andExpect(status().isOk());
    }

    @Test
    @DisplayName("CT-BE-VAG-02: candidato não publica vaga")
    void candidatoNaoPublica() throws Exception {
        Conta ana = novoUsuario("Ana");
        postComo(ana, "/api/vagas", VAGA).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CT-BE-VAG-03: empresa publica vaga com data de hoje e sem expor a própria empresa")
    void empresaPublicaVaga() throws Exception {
        Conta empresa = novaEmpresa("Alfa");
        postComo(empresa, "/api/vagas", VAGA)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.cargo").value("Desenvolvedor Java"))
                .andExpect(jsonPath("$.dataPublicacao").value(LocalDate.now().toString()))
                .andExpect(jsonPath("$.empresa").doesNotExist());
    }

    @Test
    @DisplayName("CT-BE-VAG-04: quem segue a empresa recebe aviso de vaga nova")
    void seguidorRecebeAvisoDeVaga() throws Exception {
        Conta empresa = novaEmpresa("Alfa");
        Conta ana = novoUsuario("Ana");
        seguir(ana, empresa);

        postComo(empresa, "/api/vagas", VAGA).andExpect(status().isCreated());

        getComo(ana, "/notificacoes")
                .andExpect(jsonPath("$[*].tipo", hasItem("NOVA_VAGA_EMPRESA")))
                .andExpect(jsonPath("$[*].titulo", hasItem("Nova vaga de Alfa")));
    }

    @Test
    @DisplayName("CT-BE-VAG-05: experiência mínima negativa é recusada")
    void experienciaNegativa() throws Exception {
        Conta empresa = novaEmpresa("Alfa");
        postComo(empresa, "/api/vagas", VAGA.replace("\"experienciaMinima\":2", "\"experienciaMinima\":-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campo").value("experienciaMinima"));
    }

    @Test
    @DisplayName("CT-BE-VAG-06: cargo em branco é recusado")
    void cargoEmBranco() throws Exception {
        Conta empresa = novaEmpresa("Alfa");
        postComo(empresa, "/api/vagas", VAGA.replace("Desenvolvedor Java", " "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campo").value("cargo"));
    }

    @Test
    @DisplayName("CT-BE-VAG-07: vaga sem salário base é recusada")
    void vagaSemSalario() throws Exception {
        Conta empresa = novaEmpresa("Alfa");
        postComo(empresa, "/api/vagas", "{\"cargo\":\"Dev\",\"skillsExigidas\":[],\"experienciaMinima\":0}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campo").value("salarioBase"));
    }

    @Test
    @DisplayName("CT-BE-VAG-08: 'minhas vagas' traz apenas as vagas da empresa logada")
    void minhasVagas() throws Exception {
        Conta alfa = novaEmpresa("Alfa");
        Conta beta = novaEmpresa("Beta");
        postComo(alfa, "/api/vagas", VAGA).andExpect(status().isCreated());
        postComo(beta, "/api/vagas", VAGA.replace("Desenvolvedor Java", "Analista de Dados")).andExpect(status().isCreated());

        getComo(alfa, "/api/vagas/minhas")
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].cargo").value("Desenvolvedor Java"));
    }
}

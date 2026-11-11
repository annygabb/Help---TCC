package com.example.Help.integracao;

import com.example.Help.suporte.IntegracaoBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Integração: perfil do candidato (/perfis/me)")
class PerfilTest extends IntegracaoBase {

    private static String perfil(String nome, String fotoUrl, String experiencias, String cursos) {
        String foto = fotoUrl == null ? "null" : "\"" + fotoUrl + "\"";
        return """
                {"nome":"%s","cargo":"Dev","localidade":"Anápolis, GO","bio":"Resumo",
                 "fotoUrl":%s,"experiencias":%s,"cursos":%s}
                """.formatted(nome, foto, experiencias, cursos);
    }

    @Test
    @DisplayName("CT-BE-PERF-01: o primeiro acesso cria o perfil com o nome do cadastro")
    void primeiroAcessoCriaPerfil() throws Exception {
        Conta ana = novoUsuario("Ana Souza");
        getComo(ana, "/perfis/me")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Ana Souza"))
                .andExpect(jsonPath("$.usuarioId").value(ana.id()))
                .andExpect(jsonPath("$.experiencias", hasSize(0)))
                .andExpect(jsonPath("$.cursos", hasSize(0)));
    }

    @Test
    @DisplayName("CT-BE-PERF-02: foto de ~4 MB (5,6 milhões de caracteres) é salva inteira")
    void fotoGrandeSalvaInteira() throws Exception {
        Conta ana = novoUsuario("Ana");
        String foto = "data:image/jpeg;base64," + "A".repeat(5_600_000);
        putComo(ana, "/perfis/me", perfil("Ana", foto, "[]", "[]")).andExpect(status().isOk());

        getComo(ana, "/perfis/me").andExpect(jsonPath("$.fotoUrl").value(foto));
    }

    @Test
    @DisplayName("CT-BE-PERF-03: certificado de ~3 MB anexado a um curso é salvo")
    void certificadoGrandeSalvo() throws Exception {
        Conta ana = novoUsuario("Ana");
        String certificado = "data:application/pdf;base64," + "B".repeat(3_000_000);
        String cursos = "[{\"nomeCurso\":\"Java\",\"instituicao\":\"Uni\",\"cargaHoraria\":\"40h\",\"tempoDuracao\":\"2m\",\"certificadoUrl\":\"%s\"}]"
                .formatted(certificado);
        putComo(ana, "/perfis/me", perfil("Ana", null, "[]", cursos))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cursos[0].certificadoUrl").value(certificado));
    }

    @Test
    @DisplayName("CT-BE-PERF-04: foto acima do limite de 6 MB codificados é recusada")
    void fotoAcimaDoLimite() throws Exception {
        Conta ana = novoUsuario("Ana");
        putComo(ana, "/perfis/me", perfil("Ana", "A".repeat(6_291_457), "[]", "[]"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campo").value("fotoUrl"))
                .andExpect(jsonPath("$.mensagem").value("A foto codificada excede o limite permitido."));
    }

    @Test
    @DisplayName("CT-BE-PERF-05: enviar fotoUrl nulo mantém a foto que já existia")
    void fotoNulaMantemAAtual() throws Exception {
        Conta ana = novoUsuario("Ana");
        putComo(ana, "/perfis/me", perfil("Ana", "data:image/png;base64,AAAA", "[]", "[]")).andExpect(status().isOk());
        putComo(ana, "/perfis/me", perfil("Ana", null, "[]", "[]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fotoUrl").value("data:image/png;base64,AAAA"));
    }

    @Test
    @DisplayName("CT-BE-PERF-06: enviar fotoUrl vazio remove a foto")
    void fotoVaziaRemove() throws Exception {
        Conta ana = novoUsuario("Ana");
        putComo(ana, "/perfis/me", perfil("Ana", "data:image/png;base64,AAAA", "[]", "[]")).andExpect(status().isOk());
        putComo(ana, "/perfis/me", perfil("Ana", "", "[]", "[]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fotoUrl").value(""));
    }

    @Test
    @DisplayName("CT-BE-PERF-07: experiência marcada como atual descarta a data de término")
    void experienciaAtualSemDataDeTermino() throws Exception {
        Conta ana = novoUsuario("Ana");
        String exp = "[{\"empresa\":\"Help\",\"cargo\":\"Dev\",\"trabalhaAtualmente\":true,\"dataInicio\":\"2024-01-01\",\"dataFim\":\"2025-01-01\"}]";
        putComo(ana, "/perfis/me", perfil("Ana", null, exp, "[]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.experiencias[0].trabalhaAtualmente").value(true))
                .andExpect(jsonPath("$.experiencias[0].dataFim").value(nullValue()));
    }

    @Test
    @DisplayName("CT-BE-PERF-08: salvar de novo substitui as experiências anteriores")
    void salvarSubstituiExperiencias() throws Exception {
        Conta ana = novoUsuario("Ana");
        String duas = "[{\"empresa\":\"A\",\"cargo\":\"X\"},{\"empresa\":\"B\",\"cargo\":\"Y\"}]";
        putComo(ana, "/perfis/me", perfil("Ana", null, duas, "[]")).andExpect(jsonPath("$.experiencias", hasSize(2)));
        putComo(ana, "/perfis/me", perfil("Ana", null, "[{\"empresa\":\"C\",\"cargo\":\"Z\"}]", "[]"))
                .andExpect(jsonPath("$.experiencias", hasSize(1)))
                .andExpect(jsonPath("$.experiencias[0].empresa").value("C"));
    }

    @Test
    @DisplayName("CT-BE-PERF-09: espaços nas pontas do nome são removidos")
    void nomeEhAparado() throws Exception {
        Conta ana = novoUsuario("Ana");
        putComo(ana, "/perfis/me", perfil("   Ana Clara   ", null, "[]", "[]"))
                .andExpect(jsonPath("$.nome").value("Ana Clara"));
    }

    @Test
    @DisplayName("CT-BE-PERF-10: resumo acima de 4.000 caracteres é recusado")
    void bioAcimaDoLimite() throws Exception {
        Conta ana = novoUsuario("Ana");
        String corpo = "{\"nome\":\"Ana\",\"bio\":\"%s\"}".formatted("b".repeat(4001));
        putComo(ana, "/perfis/me", corpo)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campo").value("bio"));
    }

    @Test
    @DisplayName("CT-BE-PERF-11: o nome novo do perfil passa a valer em /auth/me")
    void nomeNovoValeNoAuthMe() throws Exception {
        Conta ana = novoUsuario("Ana");
        putComo(ana, "/perfis/me", perfil("Ana Clara Souza", null, "[]", "[]")).andExpect(status().isOk());
        getComo(ana, "/auth/me").andExpect(jsonPath("$.nome").value("Ana Clara Souza"));
    }

    @Test
    @DisplayName("CT-BE-PERF-12: empresa não tem perfil de candidato (400 com explicação)")
    void empresaNaoTemPerfilDeCandidato() throws Exception {
        Conta empresa = novaEmpresa("Alfa");
        getComo(empresa, "/perfis/me")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Este recurso está disponível apenas para contas de candidato."));
    }

    @Test
    @DisplayName("CT-BE-PERF-13: perfis de duas pessoas não se misturam ao salvar")
    void perfisNaoSeMisturam() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        putComo(ana, "/perfis/me", perfil("Ana Editada", null, "[{\"empresa\":\"Help\",\"cargo\":\"Dev\"}]", "[]"))
                .andExpect(status().isOk());
        getComo(bruno, "/perfis/me")
                .andExpect(jsonPath("$.nome").value("Bruno"))
                .andExpect(jsonPath("$.experiencias", hasSize(0)));
    }
}

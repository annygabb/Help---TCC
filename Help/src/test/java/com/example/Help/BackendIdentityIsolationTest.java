package com.example.Help;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "app.admin.emails=admin@help.test")
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BackendIdentityIsolationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void loginIgnoraMaiusculasEMeRetornaAIdentidadeCanonica() throws Exception {
        cadastrarUsuario("Usuária Oficial", "oficial@help.test", "52998224725");

        String token = loginUsuario("OFICIAL@HELP.TEST");

        mockMvc.perform(get("/auth/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("oficial@help.test"))
                .andExpect(jsonPath("$.nome").value("Usuária Oficial"))
                .andExpect(jsonPath("$.tipoConta").value("CANDIDATO"))
                .andExpect(jsonPath("$.ativo").value(true));
    }

    @Test
    void doisUsuariosMantemPerfisIndependentes() throws Exception {
        cadastrarUsuario("Usuário A", "a@help.test", "52998224725");
        cadastrarUsuario("Usuário B", "b@help.test", "11144477735");

        String tokenA = loginUsuario("a@help.test");
        String tokenB = loginUsuario("b@help.test");

        atualizarPerfil(tokenA, "Perfil A", "Analista A");
        atualizarPerfil(tokenB, "Perfil B", "Analista B");

        mockMvc.perform(get("/perfis/me").header("Authorization", bearer(tokenA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Perfil A"))
                .andExpect(jsonPath("$.cargo").value("Analista A"));

        mockMvc.perform(get("/perfis/me").header("Authorization", bearer(tokenB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Perfil B"))
                .andExpect(jsonPath("$.cargo").value("Analista B"));
    }

    @Test
    void emailConfiguradoComoAdminAcessaResumoEUsuarioComumRecebeForbidden() throws Exception {
        cadastrarUsuario("Administradora", "admin@help.test", "52998224725");
        cadastrarUsuario("Pessoa comum", "pessoa@help.test", "11144477735");

        String tokenAdmin = loginUsuario("admin@help.test");
        String tokenComum = loginUsuario("pessoa@help.test");

        mockMvc.perform(get("/auth/me").header("Authorization", bearer(tokenAdmin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tipoConta").value("ADMIN"));

        mockMvc.perform(get("/admin/resumo").header("Authorization", bearer(tokenAdmin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalContas").isNumber())
                .andExpect(jsonPath("$.totalEmpresas").isNumber());

        mockMvc.perform(get("/admin/resumo").header("Authorization", bearer(tokenComum)))
                .andExpect(status().isForbidden());
    }

    @Test
    void empresaNaoPodeAlterarVagaDeOutraEmpresa() throws Exception {
        cadastrarEmpresa("Empresa A", "empresa-a@help.test", "12345678000190");
        cadastrarEmpresa("Empresa B", "empresa-b@help.test", "98765432000110");

        String tokenA = loginEmpresa("empresa-a@help.test");
        String tokenB = loginEmpresa("empresa-b@help.test");

        String resposta = mockMvc.perform(post("/api/vagas")
                        .header("Authorization", bearer(tokenA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "cargo":"Desenvolvedor Java",
                                  "skillsExigidas":["Java","Spring"],
                                  "experienciaMinima":2,
                                  "salarioBase":8000
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String vagaId = JsonPath.read(resposta, "$.id");

        mockMvc.perform(get("/api/vagas/minhas").header("Authorization", bearer(tokenB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        mockMvc.perform(delete("/api/vagas/" + vagaId).header("Authorization", bearer(tokenB)))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/vagas/" + vagaId).header("Authorization", bearer(tokenA)))
                .andExpect(status().isNoContent());
    }

    @Test
    void empresaRecebeSuaPropriaIdentidade() throws Exception {
        cadastrarEmpresa("Empresa Identificada", "empresa@help.test", "12345678000190");
        String token = loginEmpresa("EMPRESA@HELP.TEST");

        mockMvc.perform(get("/empresas/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("empresa@help.test"))
                .andExpect(jsonPath("$.razaoSocial").value("Empresa Identificada"))
                .andExpect(jsonPath("$.tipoConta").value("EMPRESA"))
                .andExpect(jsonPath("$.ativo").value(true));
    }

    private void cadastrarUsuario(String nome, String email, String cpf) throws Exception {
        mockMvc.perform(post("/api/usuarios/cadastrar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"%s","email":"%s","senha":"Senha123","cpf":"%s"}
                                """.formatted(nome, email, cpf)))
                .andExpect(status().isCreated());
    }

    private String loginUsuario(String email) throws Exception {
        String resposta = mockMvc.perform(post("/api/usuarios/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"Senha123"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(resposta, "$.token");
    }

    private void cadastrarEmpresa(String nome, String email, String cnpj) throws Exception {
        mockMvc.perform(post("/api/empresas/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"corporateName":"%s","email":"%s","password":"Senha123","cnpj":"%s"}
                                """.formatted(nome, email, cnpj)))
                .andExpect(status().isCreated());
    }

    private String loginEmpresa(String email) throws Exception {
        String resposta = mockMvc.perform(post("/api/empresas/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"Senha123"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(resposta, "$.token");
    }

    private void atualizarPerfil(String token, String nome, String cargo) throws Exception {
        mockMvc.perform(put("/perfis/me")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome":"%s",
                                  "cargo":"%s",
                                  "localidade":"Goiânia, GO",
                                  "bio":"Perfil individual",
                                  "experiencias":[],
                                  "cursos":[]
                                }
                                """.formatted(nome, cargo)))
                .andExpect(status().isOk());
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}

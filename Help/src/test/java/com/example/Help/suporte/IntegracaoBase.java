package com.example.Help.suporte;

import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.recuperacao.TokenService;
import com.example.Help.model.usuario.TipoConta;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public abstract class IntegracaoBase {
    protected static final String SENHA = "Senha123";
    protected record Conta(String id, String email, String token, String tipo) {
        public String bearer() { return "Bearer " + token; }
    }
    @Autowired protected MockMvc mockMvc;
    @Autowired private UsuarioRepository repositorioUsuarios;
    @Autowired private EmpresaRepository repositorioEmpresas;
    @Autowired private PasswordEncoder encoder;
    @Autowired private TokenService tokenService;
    @Autowired private ObjectMapper objectMapper;

    protected String emailUnico(String nome) {
        return "teste-" + UUID.randomUUID() + "@help.test";
    }

    protected Conta novoUsuario(String nome) {
        return criarUsuario(nome, TipoConta.CANDIDATO);
    }

    protected Conta novoAdmin() {
        return criarUsuario("Administradora", TipoConta.ADMIN);
    }

    private Conta criarUsuario(String nome, TipoConta tipo) {
        Usuario usuario = new Usuario();
        usuario.setName(nome);
        usuario.setEmail(emailUnico(nome));
        usuario.setCpf(Documentos.novoCpf());
        usuario.setSenha(encoder.encode(SENHA));
        usuario.setTipoConta(tipo);
        usuario.setSessionVersion(UUID.randomUUID().toString());
        usuario = repositorioUsuarios.saveAndFlush(usuario);
        return new Conta(usuario.getId().toString(), usuario.getEmail(), tokenService.gerarToken(usuario), tipo.name());
    }

    protected Conta novaEmpresa(String nome) {
        Empresa empresa = new Empresa();
        empresa.setCorporateName(nome);
        empresa.setEmail(emailUnico(nome));
        empresa.setCnpj(Documentos.novoCnpj());
        empresa.setPassword(encoder.encode(SENHA));
        empresa.setSessionVersion(UUID.randomUUID().toString());
        empresa = repositorioEmpresas.saveAndFlush(empresa);
        return new Conta(empresa.getId().toString(), empresa.getEmail(), tokenService.gerarToken(empresa), "EMPRESA");
    }

    protected void cadastrarEmpresa(String nome, String email, String cnpj) throws Exception {
        String corpo = objectMapper.writeValueAsString(java.util.Map.of(
                "corporateName", nome, "email", email, "cnpj", cnpj, "password", SENHA));
        mockMvc.perform(post("/api/empresas/cadastro").contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isCreated());
    }

    protected String loginEmpresa(String email) throws Exception {
        String corpo = objectMapper.writeValueAsString(java.util.Map.of("email", email, "password", SENHA));
        String resposta = mockMvc.perform(post("/api/empresas/login").contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(resposta).path("token").asText();
    }

    protected String loginUsuario(String email) throws Exception {
        String corpo = objectMapper.writeValueAsString(java.util.Map.of("email", email, "password", SENHA));
        String resposta = mockMvc.perform(post("/api/usuarios/login").contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(resposta).path("token").asText();
    }

    protected String tipoSocial(Conta conta) { return "EMPRESA".equals(conta.tipo()) ? "EMPRESA" : "USUARIO"; }
    protected ResultActions getComo(Conta conta, String caminho) throws Exception {
        return mockMvc.perform(get(caminho).header("Authorization", "Bearer " + conta.token()));
    }
    protected ResultActions postComo(Conta conta, String caminho, String corpo) throws Exception {
        return mockMvc.perform(post(caminho).header("Authorization", "Bearer " + conta.token()).contentType(MediaType.APPLICATION_JSON).content(corpo));
    }
    protected ResultActions putComo(Conta conta, String caminho, String corpo) throws Exception {
        return mockMvc.perform(put(caminho).header("Authorization", "Bearer " + conta.token()).contentType(MediaType.APPLICATION_JSON).content(corpo));
    }
    protected ResultActions deleteComo(Conta conta, String caminho) throws Exception {
        return mockMvc.perform(delete(caminho).header("Authorization", "Bearer " + conta.token()));
    }
    protected ResultActions patchComo(Conta conta, String caminho, String corpo) throws Exception {
        return mockMvc.perform(patch(caminho).header("Authorization", conta.bearer()).contentType(MediaType.APPLICATION_JSON).content(corpo));
    }
    protected void seguir(Conta origem, Conta destino) throws Exception {
        postComo(origem, "/seguidores/seguir/" + tipoSocial(destino) + "/" + destino.id(), "{}").andExpect(status().isCreated());
    }
}

package com.example.Help;

import com.example.Help.Service.ParticipanteService;
import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.empresa.EmpresaRepository;
import com.example.Help.model.social.TipoParticipante;
import com.example.Help.model.usuario.Usuario;
import com.example.Help.model.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ParticipanteAutenticadoServiceTest {

    private UsuarioRepository usuarioRepository;
    private EmpresaRepository empresaRepository;
    private ParticipanteService service;

    @BeforeEach
    void configurar() {
        usuarioRepository = mock(UsuarioRepository.class);
        empresaRepository = mock(EmpresaRepository.class);
        service = new ParticipanteService(usuarioRepository, empresaRepository);
    }

    @Test
    void resolveUsuarioEEmpresaPeloPrincipalSemConfundirIdsIguais() {
        UUID idCompartilhado = UUID.randomUUID();
        Usuario usuario = usuario(idCompartilhado, "Pessoa", "pessoa@help.test", true);
        Empresa empresa = empresa(idCompartilhado, "Empresa", "empresa@help.test", true);

        var usuarioResolvido = service.obterAutenticado(
                new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities()));
        var empresaResolvida = service.obterAutenticado(
                new UsernamePasswordAuthenticationToken(empresa, null, empresa.getAuthorities()));

        assertThat(usuarioResolvido.getId()).isEqualTo(idCompartilhado);
        assertThat(usuarioResolvido.getTipoParticipante()).isEqualTo(TipoParticipante.USUARIO);
        assertThat(empresaResolvida.getId()).isEqualTo(idCompartilhado);
        assertThat(empresaResolvida.getTipoParticipante()).isEqualTo(TipoParticipante.EMPRESA);
    }

    @Test
    void rejeitaContaInativa() {
        Usuario inativo = usuario(UUID.randomUUID(), "Inativo", "inativo@help.test", false);

        assertThatThrownBy(() -> service.obterAutenticado(
                new UsernamePasswordAuthenticationToken(inativo, null, inativo.getAuthorities())))
                .hasMessageContaining("desativada");
    }

    @Test
    void diretorioExcluiContaAtualEContasInativas() {
        Usuario atual = usuario(UUID.randomUUID(), "Atual", "atual@help.test", true);
        Usuario outra = usuario(UUID.randomUUID(), "Ana Java", "ana@help.test", true);
        Usuario inativa = usuario(UUID.randomUUID(), "Ana Inativa", "inativa@help.test", false);
        Empresa empresa = empresa(UUID.randomUUID(), "Ana Tecnologia", "contato@ana.test", true);
        when(usuarioRepository.findAll()).thenReturn(List.of(atual, outra, inativa));
        when(empresaRepository.findAll()).thenReturn(List.of(empresa));

        var resultados = service.listarAtivos(atual, "ana", null);

        assertThat(resultados).extracting(p -> p.getTipoParticipante() + ":" + p.getNomeSocial())
                .containsExactlyInAnyOrder("USUARIO:Ana Java", "EMPRESA:Ana Tecnologia");
    }

    private Usuario usuario(UUID id, String nome, String email, boolean ativo) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setName(nome);
        usuario.setEmail(email);
        usuario.setSenha("Senha123");
        usuario.setAtivo(ativo);
        return usuario;
    }

    private Empresa empresa(UUID id, String nome, String email, boolean ativo) {
        Empresa empresa = new Empresa();
        empresa.setId(id);
        empresa.setCorporateName(nome);
        empresa.setEmail(email);
        empresa.setCnpj(UUID.randomUUID().toString().replace("-", "").substring(0, 14));
        empresa.setPassword("Senha123");
        empresa.setAtivo(ativo);
        return empresa;
    }
}

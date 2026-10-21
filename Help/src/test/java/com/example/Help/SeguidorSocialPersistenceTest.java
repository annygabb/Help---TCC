package com.example.Help;

import com.example.Help.model.empresa.Empresa;
import com.example.Help.model.seguidor.Seguidor;
import com.example.Help.model.social.TipoParticipante;
import com.example.Help.model.usuario.Usuario;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SeguidorSocialPersistenceTest {

    @Test
    void criaRelacaoDeUsuarioParaEmpresa() {
        Usuario usuario = new Usuario();
        Empresa empresa = new Empresa();

        Seguidor relacao = new Seguidor(usuario, empresa);

        assertThat(relacao.getSeguidorSocial()).isSameAs(usuario);
        assertThat(relacao.getSeguidoSocial()).isSameAs(empresa);
        assertThat(relacao.getSeguidorSocial().getTipoParticipante()).isEqualTo(TipoParticipante.USUARIO);
        assertThat(relacao.getSeguidoSocial().getTipoParticipante()).isEqualTo(TipoParticipante.EMPRESA);
    }

    @Test
    void rejeitaPontaVaziaOuDupla() {
        Seguidor vazio = new Seguidor();
        assertThatThrownBy(vazio::validarParticipantes).isInstanceOf(IllegalStateException.class);
    }
}

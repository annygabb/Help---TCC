package com.example.Help;

import com.example.Help.model.mensagem.Mensagem;
import com.example.Help.model.notificacao.Notificacao;
import com.example.Help.model.seguidor.Seguidor;
import jakarta.persistence.JoinColumn;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;

class SocialSchemaMappingTest {

    @Test
    void mensagemMapeiaUsuarioOuEmpresaEmCadaPonta() throws Exception {
        assertJoin(Mensagem.class, "remetenteUsuario", "remetente_id");
        assertJoin(Mensagem.class, "remetenteEmpresa", "remetente_empresa_id");
        assertJoin(Mensagem.class, "destinatarioUsuario", "destinatario_id");
        assertJoin(Mensagem.class, "destinatarioEmpresa", "destinatario_empresa_id");
    }

    @Test
    void notificacaoMapeiaDestinatarioUsuarioOuEmpresa() throws Exception {
        assertJoin(Notificacao.class, "usuario", "usuario_id");
        assertJoin(Notificacao.class, "empresa", "empresa_id");
        assertThat(Notificacao.class.getDeclaredField("origemTipo")).isNotNull();
    }

    @Test
    void seguidorMapeiaUsuarioOuEmpresaEmCadaPonta() throws Exception {
        assertJoin(Seguidor.class, "seguidorUsuario", "seguidor_id");
        assertJoin(Seguidor.class, "seguidorEmpresa", "seguidor_empresa_id");
        assertJoin(Seguidor.class, "seguidoUsuario", "seguido_id");
        assertJoin(Seguidor.class, "seguidoEmpresa", "seguido_empresa_id");
    }

    private void assertJoin(Class<?> type, String fieldName, String columnName) throws Exception {
        Field field = type.getDeclaredField(fieldName);
        JoinColumn join = field.getAnnotation(JoinColumn.class);
        assertThat(join).isNotNull();
        assertThat(join.name()).isEqualTo(columnName);
        assertThat(join.nullable()).isTrue();
    }
}

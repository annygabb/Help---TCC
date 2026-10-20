package com.example.Help;

import com.example.Help.model.usuario.Usuario;
import jakarta.persistence.Column;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class UsuarioSchemaMappingTest {

    @Test
    void nomeDoUsuarioUsaAMesmaColunaDoCadastro() throws Exception {
        Field campoNome = Usuario.class.getDeclaredField("name");
        Column coluna = campoNome.getAnnotation(Column.class);

        assertNotNull(coluna, "Usuario.name precisa declarar explicitamente a coluna compartilhada");
        assertEquals("nome", coluna.name());
    }
}

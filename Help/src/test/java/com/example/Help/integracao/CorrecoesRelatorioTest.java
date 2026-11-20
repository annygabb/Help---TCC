package com.example.Help.integracao;

import com.example.Help.suporte.IntegracaoBase;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class CorrecoesRelatorioTest extends IntegracaoBase {
    @Test void apenasEmpresaPodeSolicitarAnaliseDeIa() throws Exception {
        Conta ana = novoUsuario("Ana"); Conta empresa = novaEmpresa("Empresa");
        postComo(ana,"/api/ia/match","{\"prompt\":\"Teste\"}").andExpect(status().isForbidden());
        postComo(empresa,"/api/ia/match","{\"prompt\":\"Teste\"}").andExpect(status().isServiceUnavailable());
    }

    @Test void mesmaContaNaoRepeteDenunciaAindaAberta() throws Exception {
        Conta ana = novoUsuario("Ana"); Conta bia = novoUsuario("Bia");
        String dados = "{\"alvoTipo\":\"USUARIO\",\"alvoId\":\"%s\",\"motivo\":\"Spam\"}".formatted(bia.id());
        postComo(ana,"/denuncias",dados).andExpect(status().isOk());
        postComo(ana,"/denuncias",dados).andExpect(status().isConflict());
    }
    @Test void donoPodeExcluirPublicacaoEComentarioMasOutraContaNao() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bia = novoUsuario("Bia");
        String post = postComo(ana,"/publicacoes","{\"conteudo\":\"Teste\"}")
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String postId = JsonPath.read(post,"$.id");
        String comentario = postComo(bia,"/publicacoes/"+postId+"/comentarios","{\"conteudo\":\"Comentário\"}")
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String comentarioId = JsonPath.read(comentario,"$.id");
        deleteComo(ana,"/publicacoes/"+postId+"/comentarios/"+comentarioId).andExpect(status().isForbidden());
        deleteComo(bia,"/publicacoes/"+postId+"/comentarios/"+comentarioId).andExpect(status().isNoContent());
        deleteComo(bia,"/publicacoes/"+postId).andExpect(status().isForbidden());
        deleteComo(ana,"/publicacoes/"+postId).andExpect(status().isNoContent());
    }
    @Test void removerConversaOcultaApenasParaQuemRemoveuEBloqueioImpedeEnvio() throws Exception {
        Conta ana = novoUsuario("Ana"); Conta bia = novoUsuario("Bia");
        String corpo = "{\"destinatarioId\":\"%s\",\"tipoDestinatario\":\"USUARIO\",\"conteudo\":\"Oi\"}".formatted(bia.id());
        postComo(ana,"/mensagens/enviar",corpo).andExpect(status().isCreated());
        getComo(bia,"/mensagens/nao-lidas/total").andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1));
        deleteComo(bia,"/mensagens/conversa/USUARIO/"+ana.id()).andExpect(status().isNoContent());
        getComo(bia,"/mensagens/conversas").andExpect(status().isOk()).andExpect(jsonPath("$").isEmpty());
        getComo(ana,"/mensagens/conversas").andExpect(status().isOk()).andExpect(jsonPath("$[0].contaId").value(bia.id()));
        putComo(bia,"/mensagens/bloqueios/USUARIO/"+ana.id(),"{}").andExpect(status().isOk());
        postComo(ana,"/mensagens/enviar",corpo).andExpect(status().isBadRequest());
        deleteComo(bia,"/mensagens/bloqueios/USUARIO/"+ana.id()).andExpect(status().isOk());
        postComo(ana,"/mensagens/enviar",corpo).andExpect(status().isCreated());
    }
    @Test void perfilPublicoMostraExperienciaSemDadosPrivados() throws Exception {
        Conta ana = novoUsuario("Ana"); Conta empresa = novaEmpresa("Empresa");
        putComo(ana,"/perfis/me","""
            {"nome":"Ana","cargo":"Dev","bio":"Minha apresentação","experiencias":[{"empresa":"Empresa A","cargo":"Dev","atividades":"Java","trabalhaAtualmente":true}],"cursos":[{"nomeCurso":"Curso A","instituicao":"Escola"}]}
            """).andExpect(status().isOk());
        getComo(empresa,"/perfis/publico/"+ana.id()).andExpect(status().isOk())
                .andExpect(jsonPath("$.bio").value("Minha apresentação"))
                .andExpect(jsonPath("$.experiencias[0].empresa").value("Empresa A"))
                .andExpect(jsonPath("$.cursos[0].nomeCurso").value("Curso A"))
                .andExpect(jsonPath("$.email").doesNotExist())
                .andExpect(jsonPath("$.cursos[0].certificadoUrl").doesNotExist());
    }
}

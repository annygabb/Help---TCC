package com.example.Help.integracao;

import com.example.Help.suporte.IntegracaoBase;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Integração: mensagens diretas e notificações")
class MensagensENotificacoesTest extends IntegracaoBase {

    private String mensagem(Conta para, String texto) {
        return "{\"destinatarioId\":\"%s\",\"tipoDestinatario\":\"%s\",\"conteudo\":\"%s\"}"
                .formatted(para.id(), tipoSocial(para), texto);
    }

    @Test
    @DisplayName("CT-BE-MSG-01: candidato manda mensagem para empresa sem trocar as identidades")
    void candidatoEscreveParaEmpresa() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta empresa = novaEmpresa("Alfa");
        postComo(ana, "/mensagens/enviar", mensagem(empresa, "Olá, tenho interesse na vaga"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.remetenteId").value(ana.id()))
                .andExpect(jsonPath("$.remetenteTipo").value("USUARIO"))
                .andExpect(jsonPath("$.destinatarioId").value(empresa.id()))
                .andExpect(jsonPath("$.destinatarioTipo").value("EMPRESA"))
                .andExpect(jsonPath("$.lida").value(false))
                .andExpect(jsonPath("$.dataEnvio", endsWith("Z")));
    }

    @Test
    @DisplayName("CT-BE-MSG-02: mensagem em branco é recusada pela validação")
    void mensagemEmBranco() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        postComo(ana, "/mensagens/enviar", mensagem(bruno, "   "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campo").value("conteudo"));
    }

    @Test
    @DisplayName("CT-BE-MSG-03: não dá para mandar mensagem para si mesmo")
    void mensagemParaSiMesmo() throws Exception {
        Conta ana = novoUsuario("Ana");
        postComo(ana, "/mensagens/enviar", mensagem(ana, "oi eu"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("para si mesmo")));
    }

    @Test
    @DisplayName("CT-BE-MSG-04: destinatário inexistente é recusado")
    void destinatarioInexistente() throws Exception {
        Conta ana = novoUsuario("Ana");
        postComo(ana, "/mensagens/enviar",
                "{\"destinatarioId\":\"%s\",\"tipoDestinatario\":\"USUARIO\",\"conteudo\":\"oi\"}".formatted(UUID.randomUUID()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("não encontrado")));
    }

    @Test
    @DisplayName("CT-BE-MSG-05: a conversa aparece para quem recebeu com a última mensagem e as não lidas")
    void conversaComNaoLidas() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        postComo(ana, "/mensagens/enviar", mensagem(bruno, "primeira")).andExpect(status().isCreated());
        Thread.sleep(15);
        postComo(ana, "/mensagens/enviar", mensagem(bruno, "segunda")).andExpect(status().isCreated());

        getComo(bruno, "/mensagens/conversas")
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].contaId").value(ana.id()))
                .andExpect(jsonPath("$[0].ultimaMensagem").value("segunda"))
                .andExpect(jsonPath("$[0].naoLidas").value(2));
    }

    @Test
    @DisplayName("CT-BE-MSG-06: abrir a conversa marca as mensagens recebidas como lidas")
    void abrirConversaMarcaLidas() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        postComo(ana, "/mensagens/enviar", mensagem(bruno, "oi")).andExpect(status().isCreated());

        getComo(bruno, "/mensagens/conversa/USUARIO/" + ana.id())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].conteudo").value("oi"));
        getComo(bruno, "/mensagens/conversas").andExpect(jsonPath("$[0].naoLidas").value(0));
    }

    @Test
    @DisplayName("CT-BE-MSG-07: quem enviou não vê a própria mensagem como não lida")
    void remetenteNaoTemNaoLidas() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        postComo(ana, "/mensagens/enviar", mensagem(bruno, "oi")).andExpect(status().isCreated());

        getComo(ana, "/mensagens/conversas")
                .andExpect(jsonPath("$[0].contaId").value(bruno.id()))
                .andExpect(jsonPath("$[0].naoLidas").value(0));
    }

    @Test
    @DisplayName("CT-BE-MSG-08: várias mensagens seguidas geram uma única notificação atualizada")
    void notificacaoDeMensagemAgrupada() throws Exception {
        Conta ana = novoUsuario("Ana Souza");
        Conta bruno = novoUsuario("Bruno");
        postComo(ana, "/mensagens/enviar", mensagem(bruno, "primeira")).andExpect(status().isCreated());
        postComo(ana, "/mensagens/enviar", mensagem(bruno, "segunda")).andExpect(status().isCreated());

        getComo(bruno, "/notificacoes")
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].tipo").value("NOVA_MENSAGEM"))
                .andExpect(jsonPath("$[0].titulo").value("Nova mensagem de Ana Souza"))
                .andExpect(jsonPath("$[0].mensagem").value("segunda"));
    }

    @Test
    @DisplayName("CT-BE-MSG-09: a prévia da notificação corta textos longos em 80 caracteres + reticências")
    void previaCortadaEm80() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        postComo(ana, "/mensagens/enviar", mensagem(bruno, "x".repeat(100))).andExpect(status().isCreated());

        getComo(bruno, "/notificacoes").andExpect(jsonPath("$[0].mensagem").value("x".repeat(80) + "..."));
    }

    @Test
    @DisplayName("CT-BE-NOT-01: o total de não lidas acompanha novas notificações")
    void totalDeNaoLidas() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        getComo(bruno, "/notificacoes/nao-lidas/total").andExpect(jsonPath("$.total").value(0));
        seguir(ana, bruno);
        getComo(bruno, "/notificacoes/nao-lidas/total").andExpect(jsonPath("$.total").value(1));
    }

    @Test
    @DisplayName("CT-BE-NOT-02: marcar uma notificação como lida zera o contador")
    void marcarComoLida() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        seguir(ana, bruno);
        String lista = getComo(bruno, "/notificacoes").andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(lista, "$[0].id");

        putComo(bruno, "/notificacoes/" + id + "/marcar-lida", "{}").andExpect(status().isOk());

        getComo(bruno, "/notificacoes/nao-lidas/total").andExpect(jsonPath("$.total").value(0));
        getComo(bruno, "/notificacoes").andExpect(jsonPath("$[0].lida").value(true));
    }

    @Test
    @DisplayName("CT-BE-NOT-03: ninguém marca como lida a notificação de outra conta")
    void naoMarcaNotificacaoAlheia() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        Conta carla = novoUsuario("Carla");
        seguir(ana, bruno);
        String lista = getComo(bruno, "/notificacoes").andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(lista, "$[0].id");

        putComo(carla, "/notificacoes/" + id + "/marcar-lida", "{}")
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("não tem permissão")));
        getComo(bruno, "/notificacoes/nao-lidas/total").andExpect(jsonPath("$.total").value(1));
    }

    @Test
    @DisplayName("CT-BE-NOT-04: marcar todas como lidas limpa o contador")
    void marcarTodas() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta carla = novoUsuario("Carla");
        Conta bruno = novoUsuario("Bruno");
        seguir(ana, bruno);
        seguir(carla, bruno);
        getComo(bruno, "/notificacoes/nao-lidas/total").andExpect(jsonPath("$.total").value(2));

        putComo(bruno, "/notificacoes/marcar-todas-lidas", "{}").andExpect(status().isOk());

        getComo(bruno, "/notificacoes/nao-lidas/total").andExpect(jsonPath("$.total").value(0));
    }

    @Test
    @DisplayName("CT-BE-NOT-05: notificação inexistente é recusada")
    void notificacaoInexistente() throws Exception {
        Conta ana = novoUsuario("Ana");
        putComo(ana, "/notificacoes/" + UUID.randomUUID() + "/marcar-lida", "{}")
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Notificação não encontrada.")));
    }
}

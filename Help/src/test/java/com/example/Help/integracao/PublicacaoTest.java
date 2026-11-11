package com.example.Help.integracao;

import com.example.Help.suporte.IntegracaoBase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Integração: feed global de publicações")
class PublicacaoTest extends IntegracaoBase {

    private void publicar(Conta autor, String json) throws Exception {
        postComo(autor, "/publicacoes", json).andExpect(status().isCreated());
    }

    @Test
    @DisplayName("CT-BE-PUB-01: publicação de texto volta com autor, padrões e horário em UTC")
    void publicacaoDeTexto() throws Exception {
        Conta ana = novoUsuario("Ana Souza");
        postComo(ana, "/publicacoes", "{\"conteudo\":\"  Olá, rede!  \"}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.conteudo").value("Olá, rede!"))
                .andExpect(jsonPath("$.autorId").value(ana.id()))
                .andExpect(jsonPath("$.autorTipo").value("USUARIO"))
                .andExpect(jsonPath("$.autorNome").value("Ana Souza"))
                .andExpect(jsonPath("$.visibilidade").value("TODOS"))
                .andExpect(jsonPath("$.permissaoComentario").value("TODOS"))
                .andExpect(jsonPath("$.podeComentar").value(true));
    }

    @Test
    @DisplayName("CT-BE-PUB-02: publicação sem texto e sem mídia é recusada")
    void publicacaoVazia() throws Exception {
        Conta ana = novoUsuario("Ana");
        postComo(ana, "/publicacoes", "{\"conteudo\":\"     \"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0].mensagem").value("Escreva algo ou adicione uma mídia."));
    }

    @Test
    @DisplayName("CT-BE-PUB-03: mídia que não é imagem nem vídeo em base64 é recusada")
    void midiaComFormatoInvalido() throws Exception {
        Conta ana = novoUsuario("Ana");
        postComo(ana, "/publicacoes", "{\"conteudo\":\"veja\",\"midiaUrl\":\"https://site.example/foto.png\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0].mensagem").value("Formato de mídia inválido."));
    }

    @Test
    @DisplayName("CT-BE-PUB-04: só uma imagem, sem texto, é aceita")
    void apenasImagem() throws Exception {
        Conta ana = novoUsuario("Ana");
        postComo(ana, "/publicacoes", "{\"midiaUrl\":\"data:image/png;base64,AAAA\",\"midiaTipo\":\"image\"}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.midiaTipo").value("image"));
    }

    @Test
    @DisplayName("CT-BE-PUB-05: texto com 5.000 caracteres passa e com 5.001 é recusado (valor limite)")
    void limiteDeCaracteres() throws Exception {
        Conta ana = novoUsuario("Ana");
        postComo(ana, "/publicacoes", "{\"conteudo\":\"%s\"}".formatted("a".repeat(5000)))
                .andExpect(status().isCreated());
        postComo(ana, "/publicacoes", "{\"conteudo\":\"%s\"}".formatted("a".repeat(5001)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campo").value("conteudo"));
    }

    @Test
    @DisplayName("CT-BE-PUB-06: o feed lista da publicação mais nova para a mais antiga")
    void feedDaMaisNovaParaAMaisAntiga() throws Exception {
        Conta ana = novoUsuario("Ana");
        publicar(ana, "{\"conteudo\":\"primeira\"}");
        Thread.sleep(15);
        publicar(ana, "{\"conteudo\":\"segunda\"}");

        getComo(ana, "/publicacoes")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].conteudo").value("segunda"))
                .andExpect(jsonPath("$[1].conteudo").value("primeira"));
    }

    @Test
    @DisplayName("CT-BE-PUB-07: publicação só para seguidores aparece depois que a pessoa segue")
    void publicacaoSoParaSeguidores() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        publicar(ana, "{\"conteudo\":\"só para quem me segue\",\"visibilidade\":\"SEGUIDORES\"}");

        getComo(bruno, "/publicacoes").andExpect(jsonPath("$[*].conteudo", not(hasItem("só para quem me segue"))));
        seguir(bruno, ana);
        getComo(bruno, "/publicacoes").andExpect(jsonPath("$[*].conteudo", hasItem("só para quem me segue")));
    }

    @Test
    @DisplayName("CT-BE-PUB-08: o autor sempre vê a própria publicação restrita")
    void autorVePublicacaoRestrita() throws Exception {
        Conta ana = novoUsuario("Ana");
        publicar(ana, "{\"conteudo\":\"restrita\",\"visibilidade\":\"SEGUIDORES\"}");
        getComo(ana, "/publicacoes").andExpect(jsonPath("$[*].conteudo", hasItem("restrita")));
    }

    @Test
    @DisplayName("CT-BE-PUB-09: comentário restrito a seguidores libera só para quem segue")
    void comentarioRestrito() throws Exception {
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        publicar(ana, "{\"conteudo\":\"comente se me segue\",\"permissaoComentario\":\"SEGUIDORES\"}");

        getComo(bruno, "/publicacoes").andExpect(jsonPath("$[0].podeComentar").value(false));
        seguir(bruno, ana);
        getComo(bruno, "/publicacoes").andExpect(jsonPath("$[0].podeComentar").value(true));
    }

    @Test
    @DisplayName("CT-BE-PUB-10: comentários desativados valem até para o autor")
    void comentariosDesativados() throws Exception {
        Conta ana = novoUsuario("Ana");
        postComo(ana, "/publicacoes", "{\"conteudo\":\"sem comentários\",\"permissaoComentario\":\"DESATIVADO\"}")
                .andExpect(jsonPath("$.podeComentar").value(false));
    }

    @Test
    @DisplayName("CT-BE-PUB-11: empresa publica e aparece como Empresa no feed")
    void empresaPublica() throws Exception {
        Conta empresa = novaEmpresa("Alfa");
        postComo(empresa, "/publicacoes", "{\"conteudo\":\"Estamos contratando\"}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.autorTipo").value("EMPRESA"))
                .andExpect(jsonPath("$.autorSubtitulo").value("Empresa"));
    }

    @Test
    @DisplayName("CT-BE-PUB-12: publicações de conta desativada somem do feed")
    void contaDesativadaSomeDoFeed() throws Exception {
        Conta admin = novoAdmin();
        Conta ana = novoUsuario("Ana");
        Conta bruno = novoUsuario("Bruno");
        publicar(ana, "{\"conteudo\":\"post da Ana\"}");

        patchComo(admin, "/admin/contas/" + ana.id() + "/status", "{\"ativo\":false}").andExpect(status().isOk());

        getComo(bruno, "/publicacoes").andExpect(jsonPath("$[*].conteudo", not(hasItem("post da Ana"))));
    }

    @Test
    @DisplayName("CT-BE-PUB-13: sem login não é possível ler o feed")
    void feedExigeLogin() throws Exception {
        mockMvc.perform(get("/publicacoes")).andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CT-BE-PUB-14: visibilidade com valor desconhecido é recusada")
    void visibilidadeDesconhecida() throws Exception {
        Conta ana = novoUsuario("Ana");
        postComo(ana, "/publicacoes", "{\"conteudo\":\"x\",\"visibilidade\":\"AMIGOS\"}")
                .andExpect(status().isBadRequest());
    }
}

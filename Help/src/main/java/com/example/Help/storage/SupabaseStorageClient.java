package com.example.Help.storage;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Set;
import java.util.UUID;

/** Cliente interno: a chave privilegiada nunca deve ser enviada ao navegador. */
public final class SupabaseStorageClient {
    private static final Set<String> TIPOS = Set.of("image/jpeg", "image/png", "image/webp", "application/pdf");
    private static final int LIMITE = 8 * 1024 * 1024;
    private final URI endpoint;
    private final URI downloadEndpoint;
    private final String chave;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public SupabaseStorageClient(URI projeto, String chave, String bucket) {
        if (projeto == null || projeto.getHost() == null || projeto.getUserInfo() != null || projeto.getQuery() != null || projeto.getFragment() != null)
            throw new IllegalArgumentException("URL do Supabase inválida");
        if (chave == null || chave.isBlank() || bucket == null || !bucket.matches("[a-z0-9][a-z0-9._-]{0,99}"))
            throw new IllegalArgumentException("Configuração do armazenamento inválida");
        this.endpoint = URI.create(projeto.toString().replaceAll("/+$", "") + "/storage/v1/object/" + bucket + "/");
        this.downloadEndpoint = URI.create(projeto.toString().replaceAll("/+$", "") + "/storage/v1/object/authenticated/" + bucket + "/");
        this.chave = chave;
    }

    public String upload(UUID dono, String categoria, String tipo, byte[] arquivo) throws IOException, InterruptedException {
        if (dono == null || !Set.of("fotos", "certificados").contains(categoria) || !TIPOS.contains(tipo)
                || arquivo == null || arquivo.length == 0 || arquivo.length > LIMITE)
            throw new IllegalArgumentException("Arquivo inválido");
        if (categoria.equals("fotos") && !tipo.startsWith("image/")) throw new IllegalArgumentException("Foto inválida");
        String caminho = dono + "/" + categoria + "/" + UUID.randomUUID();
        var requisicao = request(caminho).header("Content-Type", tipo)
                .POST(HttpRequest.BodyPublishers.ofByteArray(arquivo)).build();
        var resposta = http.send(requisicao, HttpResponse.BodyHandlers.discarding());
        if (resposta.statusCode() < 200 || resposta.statusCode() >= 300) throw new IOException("Falha ao enviar arquivo ao armazenamento");
        return caminho;
    }

    public byte[] download(UUID dono, String caminho) throws IOException, InterruptedException {
        if (dono == null || caminho == null || !caminho.matches(java.util.regex.Pattern.quote(dono.toString())
                + "/(fotos|certificados)/[0-9a-fA-F-]{36}"))
            throw new IllegalArgumentException("Arquivo não pertence à conta");
        var resposta = http.send(request(downloadEndpoint, caminho).GET().build(), HttpResponse.BodyHandlers.ofByteArray());
        if (resposta.statusCode() < 200 || resposta.statusCode() >= 300 || resposta.body().length > LIMITE)
            throw new IOException("Falha ao obter arquivo do armazenamento");
        return resposta.body();
    }

    private HttpRequest.Builder request(String caminho) {
        return request(endpoint, caminho);
    }

    private HttpRequest.Builder request(URI base, String caminho) {
        return HttpRequest.newBuilder(base.resolve(caminho)).timeout(Duration.ofSeconds(20))
                .header("apikey", chave).header("Authorization", "Bearer " + chave);
    }
}

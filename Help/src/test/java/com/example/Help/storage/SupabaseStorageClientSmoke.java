package com.example.Help.storage;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

/** Executável sem dependências externas: java ... SupabaseStorageClientSmoke */
public class SupabaseStorageClientSmoke {
    public static void main(String[] args) throws Exception {
        var lastPath = new AtomicReference<String>();
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/storage/v1/object/help-arquivos/", exchange -> {
            lastPath.set(exchange.getRequestURI().getPath());
            if (!"test-key".equals(exchange.getRequestHeaders().getFirst("apikey"))) {
                exchange.sendResponseHeaders(401, -1);
            } else if (exchange.getRequestMethod().equals("POST")) {
                exchange.getRequestBody().readAllBytes();
                exchange.sendResponseHeaders(200, -1);
            } else {
                exchange.sendResponseHeaders(200, 3);
                exchange.getResponseBody().write("abc".getBytes(StandardCharsets.UTF_8));
            }
            exchange.close();
        });
        server.createContext("/storage/v1/object/authenticated/help-arquivos/", exchange -> {
            lastPath.set(exchange.getRequestURI().getPath());
            if (!"test-key".equals(exchange.getRequestHeaders().getFirst("apikey"))) {
                exchange.sendResponseHeaders(401, -1);
            } else {
                exchange.sendResponseHeaders(200, 3);
                exchange.getResponseBody().write("abc".getBytes(StandardCharsets.UTF_8));
            }
            exchange.close();
        });
        server.start();
        try {
            var client = new SupabaseStorageClient(URI.create("http://127.0.0.1:" + server.getAddress().getPort()), "test-key", "help-arquivos");
            UUID owner = UUID.randomUUID();
            String path = client.upload(owner, "certificados", "application/pdf", "abc".getBytes(StandardCharsets.UTF_8));
            if (!path.startsWith(owner + "/certificados/")) throw new AssertionError("Objeto não está vinculado ao proprietário");
            if (!lastPath.get().endsWith(path)) throw new AssertionError("Caminho incorreto");
            if (!new String(client.download(owner, path), StandardCharsets.UTF_8).equals("abc")) throw new AssertionError("Download incorreto");
            if (!lastPath.get().contains("/object/authenticated/")) throw new AssertionError("Download privado deve usar rota autenticada");
            try {
                client.download(UUID.randomUUID(), path);
                throw new AssertionError("Acesso de outra conta foi permitido");
            } catch (IllegalArgumentException expected) { }
            System.out.println("SupabaseStorageClientSmoke: OK");
        } finally { server.stop(0); }
    }
}

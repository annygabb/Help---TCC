package com.example.Help.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class ArquivoService {

    private final String uploadDir = "uploads/";

    private final List<String> EXTENSOES_PERMITIDAS = Arrays.asList("pdf", "jpg", "jpeg", "png"); //Lista de extensões e tipos permitidos
    private final List<String> TIPOS_MIME_PERMITIDOS = Arrays.asList("application/pdf", "image/jpeg", "image/png");

    public String salvarArquivo(MultipartFile arquivo, String subpasta) throws IOException {
        if (arquivo == null || arquivo.isEmpty()) return null;

        String nomeOriginal = arquivo.getOriginalFilename();//Validar Extensão
        if (nomeOriginal == null || !nomeOriginal.contains(".")) {
            throw new IOException("Arquivo inválido (sem extensão).");
        }

        String extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf(".") + 1).toLowerCase();
        if (!EXTENSOES_PERMITIDAS.contains(extensao)) {
            throw new IOException("Extensão ." + extensao + " não é permitida. Use PDF, JPG ou PNG.");
        }

        String contentType = arquivo.getContentType();//Validar Content Type (MIME Type)
        if (contentType == null || !TIPOS_MIME_PERMITIDOS.contains(contentType)) {
            throw new IOException("Tipo de arquivo não permitido: " + contentType);
        }

        Path diretorioPath = Paths.get(uploadDir + subpasta);//Criar diretório se não existir
        if (!Files.exists(diretorioPath)) {
            Files.createDirectories(diretorioPath);
        }

        String nomeArquivo = UUID.randomUUID().toString() + "_" + nomeOriginal;//Gerar nome único para evitar sobrescrita
        Path destino = diretorioPath.resolve(nomeArquivo);

        Files.copy(arquivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);//Salvar o arquivo

        return nomeArquivo;
    }
}
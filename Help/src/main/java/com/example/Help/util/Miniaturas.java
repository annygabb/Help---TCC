package com.example.Help.util;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.HexFormat;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

/** Miniaturas para listagens: preserva o original no perfil para edição. */
public final class Miniaturas {
    private static final Map<String, String> CACHE = Collections.synchronizedMap(new LinkedHashMap<>(64, .75f, true) {
        @Override protected boolean removeEldestEntry(Map.Entry<String, String> item) { return size() > 64; }
    });
    private static final Semaphore PROCESSAMENTO = new Semaphore(2);
    private Miniaturas() {}
    public static String avatar(String imagem) { return reduzir(imagem, 256); }
    public static String publicacao(String imagem) { return reduzir(imagem, 1280); }
    private static String reduzir(String imagem, int maximo) {
        if (imagem == null || imagem.length() < 80000 || !imagem.startsWith("data:image/")) return imagem;
        int virgula = imagem.indexOf(',');
        if (virgula < 0 || !imagem.substring(0, virgula).endsWith(";base64") || imagem.length() > 15000000) return imagem;
        try {
            String chave = maximo + ":" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(imagem.getBytes(StandardCharsets.UTF_8)));
            String guardada = CACHE.get(chave);
            if (guardada != null) return guardada;
            // Evita enviar o original pesado e também evita bloquear o servidor
            // indefinidamente quando o processamento estiver sobrecarregado.
            if (!PROCESSAMENTO.tryAcquire(2, TimeUnit.SECONDS)) return null;
            try {
            BufferedImage original;
            try (var entrada = ImageIO.createImageInputStream(new ByteArrayInputStream(Base64.getDecoder().decode(imagem.substring(virgula + 1))))) {
                var leitores = ImageIO.getImageReaders(entrada);
                if (!leitores.hasNext()) return imagem;
                var leitor = leitores.next();
                try {
                    leitor.setInput(entrada, true, true);
                    if ((long) leitor.getWidth(0) * leitor.getHeight(0) > 16000000L) return imagem;
                    original = leitor.read(0);
                } finally { leitor.dispose(); }
            }
            if (original == null || original.getWidth() < 1 || original.getHeight() < 1) return imagem;
            double escala = Math.min(1d, (double) maximo / Math.max(original.getWidth(), original.getHeight()));
            int largura = Math.max(1, (int) Math.round(original.getWidth() * escala));
            int altura = Math.max(1, (int) Math.round(original.getHeight() * escala));
            boolean transparente = original.getColorModel().hasAlpha();
            BufferedImage pequena = new BufferedImage(largura, altura, transparente ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB);
            Graphics2D g = pequena.createGraphics();
            if (!transparente) { g.setColor(Color.WHITE); g.fillRect(0, 0, largura, altura); }
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.drawImage(original, 0, 0, largura, altura, null); g.dispose();
            ByteArrayOutputStream saida = new ByteArrayOutputStream();
            String formato = transparente ? "png" : "jpeg";
            if (!ImageIO.write(pequena, formato, saida)) return imagem;
            String resultado = "data:image/" + formato + ";base64," + Base64.getEncoder().encodeToString(saida.toByteArray());
            if (resultado.length() >= imagem.length()) return imagem;
            CACHE.put(chave, resultado);
            return resultado;
            } finally { PROCESSAMENTO.release(); }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        } catch (Exception e) { return imagem; }
    }
}

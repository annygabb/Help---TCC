package com.example.Help.suporte;

import java.util.concurrent.atomic.AtomicLong;

/** Dados distintos para testes: nunca use documentos reais. */
public final class Documentos {
    private static final AtomicLong SEQUENCIA = new AtomicLong(10000000000000L);
    private Documentos() { }
    public static String novoCnpj() {
        return Long.toString(SEQUENCIA.incrementAndGet());
    }
    public static String novoCpf() {
        String base = String.format("%09d", SEQUENCIA.incrementAndGet() % 1_000_000_000L);
        return base + digito(base, 10) + digito(base + digito(base, 10), 11);
    }
    private static int digito(String base, int peso) {
        int soma = 0;
        for (int i = 0; i < base.length(); i++) soma += (base.charAt(i) - '0') * (peso - i);
        int resto = (soma * 10) % 11;
        return resto == 10 ? 0 : resto;
    }
}

// ============================================================
// TESTE 0 - AMBIENTE
// Local correto: Help/frontend/tests/ambiente.test.js
//
// Este e o primeiro teste a rodar. Se ele passar, o ambiente
// de testes esta configurado corretamente.
// ============================================================

import { describe, it, expect } from 'vitest';

describe('Ambiente de testes', () => {
  it('o motor de testes esta funcionando', () => {
    expect(2 + 2).toBe(4);
  });

  it('existe um navegador simulado (jsdom)', () => {
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');
  });

  it('o localStorage esta disponivel e vazio no inicio', () => {
    expect(typeof localStorage).toBe('object');
    expect(localStorage.length).toBe(0);
  });

  it('os matchers do jest-dom foram carregados', () => {
    const div = document.createElement('div');
    div.textContent = 'ola';
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
  });

  it('alert() esta simulado e nao quebra o teste', () => {
    expect(() => alert('teste')).not.toThrow();
  });
});

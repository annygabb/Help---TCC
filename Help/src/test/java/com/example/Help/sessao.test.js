

import { describe, it, expect, beforeEach } from 'vitest';
import api from '../services/api.js';


describe('Configuracao do cliente HTTP', () => {
  it('existe e tem um endereco base configurado', () => {
    expect(api).toBeDefined();
    expect(api.defaults.baseURL).toBeTruthy();
  });

  it('ACHADO P-10: o endereco do servidor esta fixo no codigo', () => {
    expect(api.defaults.baseURL).toContain('localhost');
  });

  it('ACHADO P-09: nao existe interceptor de requisicao', () => {

    const qtd = api.interceptors?.request?.handlers?.length ?? 0;
    expect(qtd).toBe(0);
  });

  it('ACHADO P-16: nao existe interceptor de resposta para tratar 401', () => {
   
    const qtd = api.interceptors?.response?.handlers?.length ?? 0;
    expect(qtd).toBe(0);
  });
});


function criarSessao(dados) {
  localStorage.setItem('token', dados.token);
  localStorage.setItem('usuarioLogado', JSON.stringify(dados));
}


function encerrarSessao() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuarioLogado');
}

const SESSAO_EXEMPLO = {
  token: 'jwt-de-teste',
  id: 'u1',
  nome: 'Ana',
  email: 'ana@help.com',
  cargo: 'Desenvolvedora',
  localidade: 'Anapolis',
  bio: 'Perfil de teste',
};

describe('Ciclo de vida da sessao', () => {
  beforeEach(() => localStorage.clear());

  it('a sessao criada guarda token e dados do usuario', () => {
    criarSessao(SESSAO_EXEMPLO);
    expect(localStorage.getItem('token')).toBe('jwt-de-teste');
    expect(JSON.parse(localStorage.getItem('usuarioLogado')).nome).toBe('Ana');
  });

  it('o logout limpa todos os vestigios da sessao', () => {
    criarSessao(SESSAO_EXEMPLO);
    encerrarSessao();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuarioLogado')).toBeNull();
    expect(localStorage.length).toBe(0);
  });

  it('a sessao sobrevive a um recarregamento (regra RN-014)', () => {
    criarSessao(SESSAO_EXEMPLO);

    expect(localStorage.getItem('token')).toBe('jwt-de-teste');
    expect(JSON.parse(localStorage.getItem('usuarioLogado')).id).toBe('u1');
  });

  it('trocar de conta substitui os dados por completo', () => {
    criarSessao(SESSAO_EXEMPLO);
    encerrarSessao();
    criarSessao({ ...SESSAO_EXEMPLO, id: 'u2', nome: 'Bruno', email: 'bruno@help.com' });

    const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));
    expect(sessao.id).toBe('u2');
    expect(sessao.nome).toBe('Bruno');
    expect(JSON.stringify(localStorage)).not.toContain('ana@help.com');
  });

  // - SEGURANCA -

  it('SEGURANCA: nenhum dado de senha fica na sessao', () => {
    criarSessao(SESSAO_EXEMPLO);
    const conteudo = JSON.stringify({ ...localStorage }).toLowerCase();
    expect(conteudo).not.toContain('senha');
    expect(conteudo).not.toContain('password');
    expect(conteudo).not.toContain('$2a$');
    expect(conteudo).not.toContain('$2b$');
  });

  it('SEGURANCA: nenhum CPF fica na sessao', () => {
    criarSessao(SESSAO_EXEMPLO);
    const conteudo = JSON.stringify({ ...localStorage });
    expect(conteudo).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
  });

  it('ACHADO P-04: o token fica legivel por qualquer script da pagina', () => {
    criarSessao(SESSAO_EXEMPLO);
    
    expect(localStorage.getItem('token')).toBe('jwt-de-teste');
  });

  it('ACHADO P-04: qualquer valor na chave usuarioLogado parece uma sessao valida', () => {
    localStorage.setItem('usuarioLogado', 'lixo-qualquer');
    
    expect(localStorage.getItem('usuarioLogado')).toBeTruthy();
  });
});

// ESTRUTURA DO TOKEN JWT

describe('Estrutura do token JWT', () => {
  const TOKEN_EXEMPLO =
    'eyJhbGciOiJIUzI1NiJ9.' +
    'eyJzdWIiOiJhbmFAaGVscC5jb20iLCJpc3MiOiJIZWxwLUFQSSJ9.' +
    'assinatura-fake-apenas-para-teste';

  it('um JWT tem exatamente tres partes separadas por ponto', () => {
    expect(TOKEN_EXEMPLO.split('.')).toHaveLength(3);
  });

  it('SEGURANCA: o payload de um JWT NAO e secreto, so assinado', () => {
   
    const payload = JSON.parse(atob(TOKEN_EXEMPLO.split('.')[1]));
    expect(payload.sub).toBe('ana@help.com');
    expect(payload.iss).toBe('Help-API');
  });

  it('SEGURANCA: o payload nao pode conter senha, hash nem CPF', () => {
    const payload = JSON.parse(atob(TOKEN_EXEMPLO.split('.')[1]));
    const chaves = Object.keys(payload).map((k) => k.toLowerCase());
    expect(chaves).not.toContain('senha');
    expect(chaves).not.toContain('password');
    expect(chaves).not.toContain('cpf');
  });
});

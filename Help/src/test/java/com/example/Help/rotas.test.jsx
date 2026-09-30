import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('../pages/Home.jsx', () => ({ default: () => <div>TELA HOME</div> }));
vi.mock('../pages/Login.jsx', () => ({ default: () => <div>TELA LOGIN</div> }));
vi.mock('../pages/Cadastro.jsx', () => ({ default: () => <div>TELA CADASTRO</div> }));
vi.mock('../pages/Feed.jsx', () => ({ default: () => <div>TELA FEED</div> }));
vi.mock('../pages/ConfigPerfil.jsx', () => ({ default: () => <div>TELA PERFIL</div> }));
vi.mock('../pages/Cursos.jsx', () => ({ default: () => <div>TELA CURSOS</div> }));
vi.mock('../pages/Vagas.jsx', () => ({ default: () => <div>TELA VAGAS</div> }));
vi.mock('../pages/Talentos.jsx', () => ({ default: () => <div>TELA TALENTOS</div> }));
vi.mock('../pages/DashboardRH.jsx', () => ({ default: () => <div>TELA RH</div> }));
vi.mock('../pages/CadastroEmpresa.jsx', () => ({ default: () => <div>TELA CAD EMPRESA</div> }));
vi.mock('../pages/LoginEmpresa.jsx', () => ({ default: () => <div>TELA LOGIN EMPRESA</div> }));
vi.mock('../pages/RecuperarSenha.jsx', () => ({ default: () => <div>TELA RECUPERAR</div> }));
vi.mock('../pages/CriarPublicacao.jsx', () => ({ default: () => <div>TELA PUBLICACAO</div> }));
vi.mock('../pages/Mensagens.jsx', () => ({ default: () => <div>TELA MENSAGENS</div> }));
vi.mock('../pages/Notificacoes.jsx', () => ({ default: () => <div>TELA NOTIFICACOES</div> }));

import App from '../src/App.jsx';


function irPara(rota) {
  window.location.hash = rota;
}

describe('Protecao de rotas do front-end', () => {
  beforeEach(() => {
    localStorage.clear();
    irPara('#/');
  });

  // --- ROTAS PUBLICAS ---

  it('a home abre sem login', async () => {
    irPara('#/');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA HOME')).toBeInTheDocument());
  });

  it('a tela de login abre sem login', async () => {
    irPara('#/login');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA LOGIN')).toBeInTheDocument());
  });

  it('a tela de cadastro abre sem login', async () => {
    irPara('#/cadastro');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA CADASTRO')).toBeInTheDocument());
  });

  // ----- ROTAS PROTEGIDAS SEM SESSAO ----

  it('SEM sessao, /feed redireciona para o login', async () => {
    irPara('#/feed');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA LOGIN')).toBeInTheDocument());
    expect(screen.queryByText('TELA FEED')).not.toBeInTheDocument();
  });

  it('SEM sessao, /configuracao-perfil redireciona para o login', async () => {
    irPara('#/configuracao-perfil');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA LOGIN')).toBeInTheDocument());
    expect(screen.queryByText('TELA PERFIL')).not.toBeInTheDocument();
  });

  it('SEM sessao, /cursos redireciona para o login', async () => {
    irPara('#/cursos');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA LOGIN')).toBeInTheDocument());
    expect(screen.queryByText('TELA CURSOS')).not.toBeInTheDocument();
  });

  it('SEM sessao, /vagas redireciona para o login', async () => {
    irPara('#/vagas');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA LOGIN')).toBeInTheDocument());
    expect(screen.queryByText('TELA VAGAS')).not.toBeInTheDocument();
  });

  it('SEM sessao, /dashboard-rh redireciona para a home', async () => {
    irPara('#/dashboard-rh');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA HOME')).toBeInTheDocument());
    expect(screen.queryByText('TELA RH')).not.toBeInTheDocument();
  });

  it('SEM sessao, /talentos redireciona para a home', async () => {
    irPara('#/talentos');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA HOME')).toBeInTheDocument());
    expect(screen.queryByText('TELA TALENTOS')).not.toBeInTheDocument();
  });

  // --- ROTAS PROTEGIDAS COM SESSAO ----

  it('COM sessao de candidato, /feed abre normalmente', async () => {
    localStorage.setItem('usuarioLogado', JSON.stringify({ id: '1', nome: 'Teste' }));
    irPara('#/feed');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA FEED')).toBeInTheDocument());
  });

  it('COM sessao de candidato, /cursos abre normalmente', async () => {
    localStorage.setItem('usuarioLogado', JSON.stringify({ id: '1', nome: 'Teste' }));
    irPara('#/cursos');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA CURSOS')).toBeInTheDocument());
  });

  it('COM token de empresa, /dashboard-rh abre normalmente', async () => {
    localStorage.setItem('token', 'jwt-da-empresa');
    irPara('#/dashboard-rh');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA RH')).toBeInTheDocument());
  });

  // ------ ROTA INEXISTENTE -----

  it('uma rota que nao existe cai na home', async () => {
    irPara('#/rota-que-nao-existe-123');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA HOME')).toBeInTheDocument());
  });

  // ---------- ACHADOS DE SEGURANCA ----------
  // ATENCAO: os testes abaixo PASSAM hoje. E por isso
  // que eles sao achados. Eles documentam que a protecao de rota
  // aceita qualquer conteudo na gaveta do navegador.

  it('ACHADO P-04: um objeto vazio no localStorage ja libera o /feed', async () => {
    localStorage.setItem('usuarioLogado', '{}');
    irPara('#/feed');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA FEED')).toBeInTheDocument());
  });

  it('ACHADO P-04: ate a palavra "qualquer-coisa" libera o /mensagens', async () => {

    localStorage.setItem('usuarioLogado', 'qualquer-coisa');
    irPara('#/mensagens');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA MENSAGENS')).toBeInTheDocument());
  });

  it('ACHADO P-05: um token qualquer libera a area de RH', async () => {
    localStorage.setItem('token', 'token-inventado-sem-assinatura');
    irPara('#/dashboard-rh');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA RH')).toBeInTheDocument());
  });

  it('ACHADO P-05: sessao de CANDIDATO tambem abre a area de RH', async () => {
  
    localStorage.setItem('usuarioLogado', JSON.stringify({ id: '1', nome: 'Candidato' }));
    irPara('#/dashboard-rh');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA RH')).toBeInTheDocument());
  });

  it('ACHADO: /anunciar nao tem protecao nenhuma', async () => {
    localStorage.clear();
    irPara('#/anunciar');
    render(<App />);
    await waitFor(() => expect(screen.getByText('TELA CAD EMPRESA')).toBeInTheDocument());
  });
});

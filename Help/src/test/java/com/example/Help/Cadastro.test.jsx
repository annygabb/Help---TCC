import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const real = await vi.importActual('react-router-dom');
  return { ...real, useNavigate: () => mockNavigate };
});

vi.mock('../services/api', () => ({ default: { post: vi.fn() } }));

import api from '../services/api';
import Cadastro from '../pages/Cadastro.jsx';


const campos = () => document.querySelectorAll('input');
const enviarFormulario = () => fireEvent.submit(document.querySelector('form'));

const preencher = async ({ nome, cpf, email, senha }) => {
  const c = campos();
  await userEvent.type(c[0], nome);
  await userEvent.type(c[1], cpf);
  await userEvent.type(c[2], email);
  await userEvent.type(c[3], senha);
};


const criado = (d) => ({
  status: 201,
  data: { id: 'uuid-1', nome: d.nome, name: d.nome, email: d.email, cpf: d.cpf.replace(/\D/g, '') },
});
const conflito = (campo, mensagem) => ({ response: { status: 409, data: { campo, mensagem } } });
const invalido = (campo, mensagem) => ({ response: { status: 400, data: [{ campo, mensagem }] } });

const VALIDO = {
  nome: 'Ana Teste',
  cpf: '529.982.247-25',
  email: 'ana.teste@help.com',
  senha: 'Teste123',
};

describe('Tela de Cadastro', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    api.post.mockReset();
    alert.mockClear();
  });

  // --------- ESTRUTURA ---------

  it('renderiza sem quebrar', () => {
    render(<Cadastro />);
    expect(document.querySelector('form')).toBeTruthy();
  });

  it('tem os quatro campos e todos sao obrigatorios', () => {
    render(<Cadastro />);
    const c = campos();
    expect(c.length).toBeGreaterThanOrEqual(4);
    for (let i = 0; i < 4; i++) {
      expect(c[i].hasAttribute('required')).toBe(true);
    }
  });

  it('o campo de e-mail usa type="email"', () => {
    render(<Cadastro />);
    expect(campos()[2].getAttribute('type')).toBe('email');
  });

  it('SEGURANCA: o campo de senha esconde o que e digitado', () => {
    render(<Cadastro />);
    expect(campos()[3].getAttribute('type')).toBe('password');
  });

  it('o campo CPF limita a 14 caracteres (mascara completa)', () => {
    render(<Cadastro />);
    const cpf = campos()[1];
    const limite = cpf.getAttribute('maxLength') || cpf.getAttribute('maxlength');
    expect(limite).toBe('14');
  });

  // ------- CAMINHO FELIZ -------- =)

  it('cadastro com sucesso (201) leva para o login', async () => {
    api.post.mockResolvedValue(criado(VALIDO));

    render(<Cadastro />);
    await preencher(VALIDO);
    enviarFormulario();

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
  });

  it('envia todos os campos preenchidos para o servidor', async () => {

    api.post.mockResolvedValue(criado(VALIDO));

    render(<Cadastro />);
    await preencher(VALIDO);
    enviarFormulario();

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    const corpo = api.post.mock.calls[0][1];
    expect(corpo.name).toBe('Ana Teste');
    expect(corpo.email).toBe('ana.teste@help.com');
    expect(corpo.cpf).toBe('529.982.247-25');
    expect(corpo.password).toBe('Teste123');
  });

  // --------- CAMINHOS DE ERRO ------- =(

  it('e-mail duplicado (409) NAO navega - ACHADO: a tela culpa a conexao', async () => {
    api.post.mockRejectedValue(conflito('email', 'E-mail já cadastrado no sistema.'));

    render(<Cadastro />);
    await preencher({ ...VALIDO, email: 'repetido@help.com' });
    enviarFormulario();

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();

    expect(alert).toHaveBeenCalledWith(expect.stringContaining('Verifique a conexão'));
  });

  it('servidor fora do ar NAO navega e nao quebra a tela', async () => {
    api.post.mockRejectedValue(new Error('Network Error'));

    render(<Cadastro />);
    await preencher(VALIDO);
    enviarFormulario();

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(document.querySelector('form')).toBeTruthy();
  });

  // ---------- ACHADOS ---------- 

  it('ACHADO P-11: CPF invalido chega ao servidor e a tela diz que ele "ja esta cadastrado"', async () => {
    api.post.mockRejectedValue(invalido('cpf', 'CPF inválido. Forneça um CPF válido com 11 dígitos.'));

    render(<Cadastro />);
    await preencher({ ...VALIDO, cpf: '111.111.111-11' });
    enviarFormulario();

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    expect(api.post.mock.calls[0][1].cpf).toBe('111.111.111-11'); 
    expect(mockNavigate).not.toHaveBeenCalled();                  
    expect(alert).toHaveBeenCalledWith(expect.stringContaining('já cadastrados'));
  });

  it('CPF sem mascara e aceito: o back-end normaliza desde 16/09', async () => {
    const semMascara = { ...VALIDO, cpf: '52998224725' };
    api.post.mockResolvedValue(criado(semMascara));

    render(<Cadastro />);
    await preencher(semMascara);
    enviarFormulario();

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
    expect(api.post.mock.calls[0][1].cpf).toBe('52998224725');
  });

  it('ACHADO: senha fora da regra chega ao servidor e a tela culpa e-mail/CPF', async () => {
    api.post.mockRejectedValue(invalido('senha', 'A senha deve ter no mínimo 8 caracteres.'));

    render(<Cadastro />);
    await preencher({ ...VALIDO, senha: 'abc' });
    enviarFormulario();

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    expect(api.post.mock.calls[0][1].password).toBe('abc');
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith(expect.stringContaining('já cadastrados'));
  });
});

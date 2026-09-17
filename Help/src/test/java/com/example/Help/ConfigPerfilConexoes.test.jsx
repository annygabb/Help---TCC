import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ConfigPerfil from '../ConfigPerfil.jsx';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));


vi.mock('axios', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: {} }), put: vi.fn(), post: vi.fn() },
}));

const usuarioLogado = {
  id: 'user-1',
  nome: 'Anny Gabrielly',
  cargo: 'Analista de Sistemas',
  email: 'anny@help.com',
};

const seguindoMock = [{ id: 'user-2', nome: 'Lucas Silva', cargo: 'Frontend' }];
const seguidoresMock = [{ id: 'user-3', nome: 'Bruno Melo', cargo: 'Backend' }];
const contagemMock = { seguidores: 1, seguindo: 1 };

function mockApiConexoes(overrides = {}) {
  const {
    seguindo = seguindoMock,
    seguidores = seguidoresMock,
    contagem = contagemMock,
    usuarios = [],
  } = overrides;

  api.get.mockImplementation((url) => {
    if (url === '/seguidores/seguindo') return Promise.resolve({ data: seguindo });
    if (url === '/seguidores/meus-seguidores') return Promise.resolve({ data: seguidores });
    if (url.startsWith('/seguidores/contagem/')) return Promise.resolve({ data: contagem });
    if (url === '/usuarios') return Promise.resolve({ data: usuarios });
    if (url === '/notificacoes/nao-lidas/total') return Promise.resolve({ data: { total: 0 } });
    if (url === '/mensagens/conversas') return Promise.resolve({ data: [] });
    return Promise.resolve({ data: [] });
  });
}

function renderConfigPerfil() {
  return render(
    <MemoryRouter>
      <ConfigPerfil />
    </MemoryRouter>
  );
}


function cardDaConexao(nome) {
  return screen.getByText(nome).closest('.conexao-card');
}

describe('ConfigPerfil - seção de Conexões', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
  });

  it('carrega e exibe os contadores de seguidores e seguindo', async () => {
    mockApiConexoes({ contagem: { seguidores: 12, seguindo: 7 } });

    renderConfigPerfil();

    const contadores = await waitFor(() =>
      document.querySelector('.conexoes-contadores')
    );

    await waitFor(() => {
      expect(within(contadores).getByText('12')).toBeInTheDocument();
      expect(within(contadores).getByText('7')).toBeInTheDocument();
    });
  });

  it('abre na aba "Seguindo" e lista quem o usuário segue', async () => {
    mockApiConexoes();

    renderConfigPerfil();

    expect(await screen.findByText('Lucas Silva')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();

    const aba = screen.getByRole('button', { name: /^seguindo$/i });
    expect(aba).toHaveClass('ativa');
  });

  it('mostra estado vazio quando o usuário não segue ninguém', async () => {
    mockApiConexoes({ seguindo: [] });

    renderConfigPerfil();

    expect(
      await screen.findByText(/você ainda não está seguindo ninguém/i)
    ).toBeInTheDocument();
  });

  it('troca para a aba "Seguidores" e lista quem segue o usuário', async () => {
    const user = userEvent.setup();
    mockApiConexoes();

    renderConfigPerfil();

    await screen.findByText('Lucas Silva');

    await user.click(screen.getByRole('button', { name: /seguidores/i }));

    expect(await screen.findByText('Bruno Melo')).toBeInTheDocument();

    expect(
      within(cardDaConexao('Bruno Melo')).getByRole('button', { name: /seguir de volta/i })
    ).toBeInTheDocument();
  });

  it('na aba "Descobrir", busca todos os usuários e exclui o próprio usuário logado', async () => {
    const user = userEvent.setup();
    mockApiConexoes({
      usuarios: [
        { id: 'user-1', name: 'Anny Gabrielly' }, // eu mesma -> deve sumir
        { id: 'user-4', name: 'Carla Dias', cargo: 'QA' },
      ],
    });

    renderConfigPerfil();

    await screen.findByText('Lucas Silva');
    await user.click(screen.getByRole('button', { name: /descobrir pessoas/i }));

    expect(await screen.findByText('Carla Dias')).toBeInTheDocument();
    expect(screen.queryByText(/^Anny Gabrielly$/)).not.toBeInTheDocument();
  });

  it('na aba "Descobrir", já marca como seguido quem eu sigo (sem duplicar botão)', async () => {
    const user = userEvent.setup();
    mockApiConexoes({
      usuarios: [
        { id: 'user-2', name: 'Lucas Silva', cargo: 'Frontend' }, // já sigo
        { id: 'user-4', name: 'Carla Dias', cargo: 'QA' },        // não sigo
      ],
    });

    renderConfigPerfil();

    await screen.findByText('Lucas Silva');
    await user.click(screen.getByRole('button', { name: /descobrir pessoas/i }));

    await screen.findByText('Carla Dias');

    expect(
      within(cardDaConexao('Carla Dias')).getByRole('button', { name: /^seguir$/i })
    ).toBeInTheDocument();
  });

  it('chama a API correta ao seguir um usuário e recarrega as conexões', async () => {
    const user = userEvent.setup();
    mockApiConexoes({
      usuarios: [{ id: 'user-4', name: 'Carla Dias', cargo: 'QA' }],
    });
    api.post.mockResolvedValue({ data: {} });

    renderConfigPerfil();

    await screen.findByText('Lucas Silva');
    await user.click(screen.getByRole('button', { name: /descobrir pessoas/i }));

    await screen.findByText('Carla Dias');
    const card = cardDaConexao('Carla Dias');
    await user.click(within(card).getByRole('button', { name: /^seguir$/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/seguidores/seguir/user-4',
        {},
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });


    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/seguidores/seguindo', expect.anything());
    });
  });

  it('chama a API correta ao deixar de seguir um usuário', async () => {
    const user = userEvent.setup();
    mockApiConexoes();
    api.delete.mockResolvedValue({ data: {} });

    renderConfigPerfil();

    await screen.findByText('Lucas Silva');
    const card = cardDaConexao('Lucas Silva');
    await user.click(within(card).getByRole('button', { name: /deixar de seguir/i }));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(
        '/seguidores/deixar-de-seguir/user-2',
        { headers: { Authorization: 'Bearer fake-token' } }
      );
    });
  });

  it('filtra a lista de conexões pelo campo de busca por nome', async () => {
    const user = userEvent.setup();
    mockApiConexoes({
      seguindo: [
        { id: 'user-2', nome: 'Lucas Silva' },
        { id: 'user-5', nome: 'Marina Costa' },
      ],
    });

    renderConfigPerfil();

    await screen.findByText('Lucas Silva');
    expect(screen.getByText('Marina Costa')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Buscar por nome...'), 'marina');

    await waitFor(() => {
      expect(screen.queryByText('Lucas Silva')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Marina Costa')).toBeInTheDocument();
  });

  it('exibe alerta e não quebra quando a API recusa a ação de seguir', async () => {
    const user = userEvent.setup();
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    mockApiConexoes({
      usuarios: [{ id: 'user-4', name: 'Carla Dias' }],
    });
    api.post.mockRejectedValue({ response: { data: 'Você já segue este usuário.' } });

    renderConfigPerfil();

    await screen.findByText('Lucas Silva');
    await user.click(screen.getByRole('button', { name: /descobrir pessoas/i }));

    await screen.findByText('Carla Dias');
    const card = cardDaConexao('Carla Dias');
    await user.click(within(card).getByRole('button', { name: /^seguir$/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Você já segue este usuário.');
    });

    alertMock.mockRestore();
  });

  it('não busca conexões quando o usuário logado não tem id', async () => {
    localStorage.setItem('usuarioLogado', JSON.stringify({ nome: 'Sem ID' }));
    mockApiConexoes();

    renderConfigPerfil();

    await waitFor(() => {
      expect(api.get).not.toHaveBeenCalledWith('/seguidores/seguindo', expect.anything());
    });
  });
});

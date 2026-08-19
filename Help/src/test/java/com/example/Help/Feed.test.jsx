import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Feed from '../Feed.jsx';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));


vi.mock('../CriarPublicacao', () => ({
  default: () => <div data-testid="modal-criar-publicacao" />,
}));

function renderFeed() {
  return render(
    <MemoryRouter initialEntries={['/feed']}>
      <Feed />
    </MemoryRouter>
  );
}


function mockContadores({ notificacoes = 0, conversas = [] } = {}) {
  api.get.mockImplementation((url) => {
    if (url === '/notificacoes/nao-lidas/total') {
      return Promise.resolve({ data: { total: notificacoes } });
    }
    if (url === '/mensagens/conversas') {
      return Promise.resolve({ data: conversas });
    }
    return Promise.resolve({ data: [] });
  });
}


function itemMenu(nome) {
  return screen.getByRole('link', { name: new RegExp(nome, 'i') });
}

describe('Feed - badges de nao lidas no cabecalho', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem(
      'usuarioLogado',
      JSON.stringify({ id: 'user-1', nome: 'Vitor Hugo', cargo: 'Tester' })
    );
  });

  it('exibe o badge de mensagens com a soma das conversas nao lidas', async () => {
    mockContadores({
      conversas: [
        { usuarioId: 'u2', naoLidas: 2 },
        { usuarioId: 'u3', naoLidas: 3 },
      ],
    });

    renderFeed();

    await waitFor(() => {
      expect(within(itemMenu('Mensagens')).getByText('5')).toBeInTheDocument();
    });
  });

  it('exibe o badge de notificacoes com o total retornado pela API', async () => {
    mockContadores({ notificacoes: 4 });

    renderFeed();

    await waitFor(() => {
      expect(within(itemMenu('Notificacoes')).getByText('4')).toBeInTheDocument();
    });
  });

  it('no exibe nenhum badge quando nao ha mensagens nem notificacoes pendentes', async () => {
    mockContadores({ notificacoes: 0, conversas: [{ usuarioId: 'u2', naoLidas: 0 }] });

    renderFeed();

  
    await waitFor(() => expect(api.get).toHaveBeenCalled());

    await waitFor(() => {
      expect(document.querySelectorAll('.nav-badge')).toHaveLength(0);
    });
  });

  it('nao quebra a renderizacao do feed quando a API de contadores falha', async () => {
    api.get.mockRejectedValue(new Error('Erro de rede'));

    renderFeed();

    await waitFor(() => expect(api.get).toHaveBeenCalled());

    expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument();
    expect(document.querySelectorAll('.nav-badge')).toHaveLength(0);
  });

  it('marca o item "Inicio" como ativo quando a rota atual e /feed', async () => {
    mockContadores();

    renderFeed();

    await waitFor(() => expect(api.get).toHaveBeenCalled());

    expect(itemMenu('Inicio')).toHaveClass('active');
    expect(itemMenu('Mensagens')).not.toHaveClass('active');
  });

  it('renderiza os dados do usuario logado vindos do localStorage', async () => {
    mockContadores();

    renderFeed();

    expect(await screen.findByText(/Anny Gabrielly/)).toBeInTheDocument();
  });
});

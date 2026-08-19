import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';

import Mensagens from '../../pages/Mensagens.jsx';
import Notificacoes from '../../pages/Notificacoes.jsx';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const ProtectedRoute = ({ children }) => {
  const usuarioLogado = localStorage.getItem('usuarioLogado');
  if (!usuarioLogado) return <Navigate to="/login" replace />;
  return children;
};

function renderRotas(rotaInicial) {
  return render(
    <MemoryRouter initialEntries={[rotaInicial]}>
      <Routes>
        <Route path="/login" element={<h1>Tela de Login</h1>} />
        <Route
          path="/mensagens"
          element={
            <ProtectedRoute>
              <Mensagens />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notificacoes"
          element={
            <ProtectedRoute>
              <Notificacoes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('Rotas protegidas de Mensagens e Notificacoes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: [] });
  });

  it('redireciona para o login ao acessar /mensagens sem estar logado', async () => {
    renderRotas('/mensagens');

    expect(await screen.findByText('Tela de Login')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^mensagens$/i })).not.toBeInTheDocument();
  });

  it('redireciona para o login ao acessar /notificacoes sem estar logado', async () => {
    renderRotas('/notificacoes');

    expect(await screen.findByText('Tela de Login')).toBeInTheDocument();
  });

  it('permite acessar /mensagens quando existe usuário logado', async () => {
    localStorage.setItem('usuarioLogado', JSON.stringify({ id: 'user-1', nome: 'Anny' }));
    localStorage.setItem('token', 'fake-token');

    renderRotas('/mensagens');

    expect(await screen.findByRole('heading', { name: /^mensagens$/i })).toBeInTheDocument();
    expect(screen.queryByText('Tela de Login')).not.toBeInTheDocument();
  });

  it('permite acessar /notificacoes quando existe usuário logado', async () => {
    localStorage.setItem('usuarioLogado', JSON.stringify({ id: 'user-1', nome: 'Anny' }));
    localStorage.setItem('token', 'fake-token');

    renderRotas('/notificacoes');

    expect(await screen.findByRole('heading', { name: /^notificações$/i })).toBeInTheDocument();
  });

  it('não dispara chamadas autenticadas à API quando o acesso é bloqueado', async () => {
    renderRotas('/mensagens');

    await screen.findByText('Tela de Login');

    await waitFor(() => {
      expect(api.get).not.toHaveBeenCalledWith('/mensagens/conversas', expect.anything());
    });
  });
});

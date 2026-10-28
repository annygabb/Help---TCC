import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 📂 Arquivos dentro da pasta "pages" (fora da pasta src)
import Home from '../pages/Home.jsx';
import Cadastro from '../pages/Cadastro.jsx';
import Feed from '../pages/Feed.jsx';
import ConfigPerfil from '../pages/ConfigPerfil.jsx';
import Cursos from '../pages/Cursos.jsx';
import DashboardRH from '../pages/DashboardRH.jsx';
import CadastroEmpresa from '../pages/CadastroEmpresa.jsx';
import CriarPublicacao from '../pages/CriarPublicacao.jsx';
import Mensagens from '../pages/Mensagens.jsx';
import Notificacoes from '../pages/Notificacoes.jsx';
import PerfilPublico from '../pages/PerfilPublico.jsx';

// 📂 Arquivos soltos na raiz do projeto (fora da pasta src)
import Login from '../pages/Login.jsx';
import LoginEmpresa from '../pages/LoginEmpresa.jsx';
import RecuperarSenha from '../pages/RecuperarSenha.jsx';
import Talentos from '../pages/Talentos.jsx';
import Vagas from '../pages/Vagas.jsx';

import AdminRoute from '../pages/admin/AdminRoute.jsx';
import AdminLayout from '../pages/admin/AdminLayout.jsx';
import AdminHome from '../pages/admin/AdminHome.jsx';
import AdminUsuarios from '../pages/admin/AdminUsuarios.jsx';
import AdminUsuarioDetalhe from '../pages/admin/AdminUsuarioDetalhe.jsx';
import AdminEmpresas from '../pages/admin/AdminEmpresas.jsx';
import AdminEmpresaDetalhe from '../pages/admin/AdminEmpresaDetalhe.jsx';
import { observarSessao, obterSessao } from '../services/session';

const SessionSynchronizer = () => {
  useEffect(() => observarSessao((sessao) => {
    if (!sessao && !window.location.hash.includes('/login')) window.location.hash = '#/login';
  }), []);
  return null;
};

const ProtectedRoute = ({ children }) => {
  if (!obterSessao()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const ProtectedRouteDupla = ({ children }) => {
  if (!obterSessao()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <SessionSynchronizer />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/login-empresa" element={<LoginEmpresa />} />
        <Route path="/cadastro-empresa" element={<CadastroEmpresa />} />

        {/* Rotas Protegidas do Candidato */}
        <Route
          path="/feed"
          element={
            <ProtectedRouteDupla>
              <Feed />
            </ProtectedRouteDupla>
          }
        />

        <Route
          path="/configuracao-perfil"
          element={
            <ProtectedRoute>
              <ConfigPerfil />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cursos"
          element={
            <ProtectedRoute>
              <Cursos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vagas"
          element={
            <ProtectedRoute>
              <Vagas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mensagens"
          element={
            <ProtectedRouteDupla>
              <Mensagens />
            </ProtectedRouteDupla>
          }
        />

        <Route
          path="/notificacoes"
          element={
            <ProtectedRouteDupla>
              <Notificacoes />
            </ProtectedRouteDupla>
          }
        />

        <Route path="/perfil/:tipo/:id" element={<ProtectedRouteDupla><PerfilPublico /></ProtectedRouteDupla>} />

        {/* Rotas Compartilhadas / RH */}
        <Route
          path="/talentos"
          element={
            <ProtectedRouteDupla>
              <Talentos />
            </ProtectedRouteDupla>
          }
        />

        <Route
          path="/dashboard-rh"
          element={
            <ProtectedRouteDupla>
              <DashboardRH />
            </ProtectedRouteDupla>
          }
        />

        {/* 🟢 CORREÇÃO AQUI: Mudamos de CriarPublicacao para CadastroEmpresa */}
        <Route
          path="/anunciar"
          element={
            <CadastroEmpresa />
          }
        />

        {/* Rota para criar posts (caso queira acessá-la por uma URL própria depois) */}
        <Route
          path="/criar-publicacao"
          element={
            <ProtectedRouteDupla>
              <CriarPublicacao />
            </ProtectedRouteDupla>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="usuarios/:id" element={<AdminUsuarioDetalhe />} />
          <Route path="empresas" element={<AdminEmpresas />} />
          <Route path="empresas/:id" element={<AdminEmpresaDetalhe />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

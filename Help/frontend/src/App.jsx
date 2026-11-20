import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// 📂 Arquivos dentro da pasta "pages" (fora da pasta src)

// 📂 Arquivos soltos na raiz do projeto (fora da pasta src)

import { observarSessao, obterSessao } from '../services/session';

const Home = lazy(() => import('../pages/Home.jsx'));
const Cadastro = lazy(() => import('../pages/Cadastro.jsx'));
const Feed = lazy(() => import('../pages/Feed.jsx'));
const ConfigPerfil = lazy(() => import('../pages/ConfigPerfil.jsx'));
const Cursos = lazy(() => import('../pages/Cursos.jsx'));
const DashboardRH = lazy(() => import('../pages/DashboardRH.jsx'));
const CadastroEmpresa = lazy(() => import('../pages/CadastroEmpresa.jsx'));
const CriarPublicacao = lazy(() => import('../pages/CriarPublicacao.jsx'));
const Mensagens = lazy(() => import('../pages/Mensagens.jsx'));
const Notificacoes = lazy(() => import('../pages/Notificacoes.jsx'));
const PerfilPublico = lazy(() => import('../pages/PerfilPublico.jsx'));
const Login = lazy(() => import('../pages/Login.jsx'));
const LoginEmpresa = lazy(() => import('../pages/LoginEmpresa.jsx'));
const RecuperarSenha = lazy(() => import('../pages/RecuperarSenha.jsx'));
const Talentos = lazy(() => import('../pages/Talentos.jsx'));
const Vagas = lazy(() => import('../pages/Vagas.jsx'));
const AdminRoute = lazy(() => import('../pages/admin/AdminRoute.jsx'));
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout.jsx'));
const AdminHome = lazy(() => import('../pages/admin/AdminHome.jsx'));
const AdminUsuarios = lazy(() => import('../pages/admin/AdminUsuarios.jsx'));
const AdminUsuarioDetalhe = lazy(() => import('../pages/admin/AdminUsuarioDetalhe.jsx'));
const AdminEmpresas = lazy(() => import('../pages/admin/AdminEmpresas.jsx'));
const AdminEmpresaDetalhe = lazy(() => import('../pages/admin/AdminEmpresaDetalhe.jsx'));
const AdminDenuncias = lazy(() => import('../pages/admin/AdminDenuncias.jsx'));
const AdminMensagens = lazy(() => import('../pages/admin/AdminMensagens.jsx'));
const AdminNotificacoes = lazy(() => import('../pages/admin/AdminNotificacoes.jsx'));
const AdminAvisos = lazy(() => import('../pages/admin/AdminAvisos.jsx'));
const AdminLogin = lazy(() => import('../pages/admin/AdminLogin.jsx'));

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
  const location = useLocation();
  if (!obterSessao()) {
    return <Navigate to="/login" state={{ retorno: location.pathname + location.search }} replace />;
  }

  return children;
};

const ProtectedCompanyRoute = ({ children }) => {
  const sessao = obterSessao();
  if (!sessao) return <Navigate to="/login-empresa" replace />;
  if (String(sessao.conta?.tipoConta || '').toUpperCase() !== 'EMPRESA') {
    return <main role="alert"><p>Esta área é exclusiva para empresas.</p><a href="#/feed">Voltar ao feed</a></main>;
  }
  return children;
};

function App() {
  return (
    <Router>
      <SessionSynchronizer />
      <Suspense fallback={<main aria-live="polite">Carregando...</main>}>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/login-empresa" element={<LoginEmpresa />} />
        <Route path="/admin/login" element={<AdminLogin />} />
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
            <ProtectedCompanyRoute>
              <Talentos />
            </ProtectedCompanyRoute>
          }
        />

        <Route
          path="/dashboard-rh"
          element={
            <ProtectedCompanyRoute>
              <DashboardRH />
            </ProtectedCompanyRoute>
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
          <Route path="denuncias" element={<AdminDenuncias />} />
          <Route path="mensagens" element={<AdminMensagens />} />
          <Route path="notificacoes" element={<AdminNotificacoes />} />
          <Route path="avisos" element={<AdminAvisos />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

import React from 'react';
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

// 📂 Arquivos soltos na raiz do projeto (fora da pasta src)
import Login from '../pages/Login.jsx';
import LoginEmpresa from '../pages/LoginEmpresa.jsx';
import RecuperarSenha from '../pages/RecuperarSenha.jsx';
import Talentos from '../pages/Talentos.jsx';
import Vagas from '../pages/Vagas.jsx';

const ProtectedRoute = ({ children }) => {
  const usuarioLogado = localStorage.getItem('usuarioLogado');

  if (!usuarioLogado) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const ProtectedRouteDupla = ({ children }) => {
  const usuarioLogado = localStorage.getItem('usuarioLogado');
  const tokenEmpresa = localStorage.getItem('token');

  if (!usuarioLogado && !tokenEmpresa) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
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
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
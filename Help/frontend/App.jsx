import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import RecuperarSenha from './pages/RecuperarSenha.jsx';
import Feed from './pages/Feed.jsx';
import ConfigPerfil from './pages/ConfigPerfil.jsx';
import Cursos from './pages/Cursos.jsx';
import Vagas from './pages/Vagas.jsx';
import DashboardRH from './pages/DashboardRH.jsx';
import Talentos from './pages/Talentos.jsx';
<<<<<<< HEAD:Help/frontend/src/App.jsx
import LoginEmpresa from './pages/LoginEmpresa.jsx';
import CadastroEmpresa from './pages/CadastroEmpresa.jsx';
=======
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/App.jsx

const ProtectedRoute = ({ children }) => {
  const usuarioLogado = localStorage.getItem('usuarioLogado');

  if (!usuarioLogado) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const ProtectedRouteEmpresa = ({ children }) => {
  const tokenEmpresa = localStorage.getItem('token');

  if (!tokenEmpresa) {
    return <Navigate to="/login-empresa" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/login-empresa" element={<LoginEmpresa />} />
        <Route path="/cadastro-empresa" element={<CadastroEmpresa />} />

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

        <Route
          path="/talentos"
          element={
<<<<<<< HEAD:Help/frontend/src/App.jsx
            <ProtectedRouteEmpresa>
              <Talentos />
            </ProtectedRouteEmpresa>
=======
            <ProtectedRoute>
              <Talentos />
            </ProtectedRoute>
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/App.jsx
          }
        />

        <Route
          path="/dashboard-rh"
          element={
<<<<<<< HEAD:Help/frontend/src/App.jsx
            <ProtectedRouteEmpresa>
              <DashboardRH />
            </ProtectedRouteEmpresa>
=======
            <ProtectedRoute>
              <DashboardRH />
            </ProtectedRoute>
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/App.jsx
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { buscarContaAtual } from '../../services/adminService';

const ContaAdminContext = createContext(null);

export const useContaAdmin = () => useContext(ContaAdminContext);

function AdminRoute({ children }) {
  const [estado, setEstado] = useState('verificando');
  const [conta, setConta] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setEstado('sem-login');
      return;
    }

    let montado = true;

    buscarContaAtual()
      .then((dados) => {
        if (!montado) return;
        if (dados?.tipoConta === 'ADMIN') {
          setConta(dados);
          setEstado('liberado');
        } else {
          setEstado('negado');
        }
      })
      .catch((erro) => {
        if (!montado) return;
        setEstado(erro?.response?.status === 401 ? 'sem-login' : 'negado');
      });

    return () => {
      montado = false;
    };
  }, []);

  if (estado === 'verificando') {
    return <div className="adm-verificando">Verificando acesso...</div>;
  }

  if (estado === 'sem-login') {
    return <Navigate to="/login" replace />;
  }

  if (estado === 'negado') {
    return <Navigate to="/" replace />;
  }

  return <ContaAdminContext.Provider value={conta}>{children}</ContaAdminContext.Provider>;
}

export default AdminRoute;

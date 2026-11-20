import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, TrendingUp } from 'lucide-react';
import { encerrarSessao, obterSessao } from '../services/session';

export default function CompanyMenu() {
  const navigate = useNavigate();
  if (String(obterSessao()?.conta?.tipoConta || '').toUpperCase() !== 'EMPRESA') return null;
  return <>
    <Link to="/dashboard-rh" className="nav-item"><TrendingUp size={22}/><span>Painel</span></Link>
    <button type="button" className="nav-item" onClick={() => { encerrarSessao(); navigate('/login-empresa'); }}><LogOut size={22}/><span>Sair</span></button>
  </>;
}

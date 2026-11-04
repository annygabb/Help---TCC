import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AlertTriangle, BellRing, LayoutDashboard, Megaphone, MessageSquareText, Users, Building2, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { encerrarSessao } from '../../services/adminService';
import { useContaAdmin } from './AdminRoute';
import './Admin.css';

const LINKS = [
  { para: '/admin', rotulo: 'Visão geral', icone: LayoutDashboard, exato: true },
  { para: '/admin/usuarios', rotulo: 'Usuários', icone: Users },
  { para: '/admin/empresas', rotulo: 'Empresas', icone: Building2 },
  { para: '/admin/denuncias', rotulo: 'Denúncias', icone: AlertTriangle },
  { para: '/admin/mensagens', rotulo: 'Mensagens', icone: MessageSquareText },
  { para: '/admin/notificacoes', rotulo: 'Notificações', icone: BellRing },
  { para: '/admin/avisos', rotulo: 'Avisos', icone: Megaphone },
];

function AdminLayout() {
  const navigate = useNavigate();
  const conta = useContaAdmin();
  const [menuAberto, setMenuAberto] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);

  const sair = () => {
    encerrarSessao();
    navigate('/login', { replace: true });
  };

  return (
    <div className="adm-container">
      <aside className={`adm-sidebar ${menuAberto ? 'aberta' : ''}`}>
        <div className="adm-sidebar-topo">
          <img src={logoImg} alt="Help" className="adm-logo" />
          <button type="button" className="adm-fechar-menu" onClick={() => setMenuAberto(false)} aria-label="Fechar menu">
            <X size={22} />
          </button>
        </div>

        <span className="adm-sidebar-titulo">
          <ShieldCheck size={16} /> Painel administrativo
        </span>

        <nav className="adm-nav">
          {LINKS.map(({ para, rotulo, icone: Icone, exato }) => (
            <NavLink
              key={para}
              to={para}
              end={exato}
              className={({ isActive }) => `adm-nav-item ${isActive ? 'ativo' : ''}`}
              onClick={() => setMenuAberto(false)}
            >
              <Icone size={20} />
              <span>{rotulo}</span>
            </NavLink>
          ))}
        </nav>

        <button type="button" className="adm-sair" onClick={() => setConfirmarSaida(true)}>
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </aside>

      {menuAberto && <div className="adm-sombra" onClick={() => setMenuAberto(false)} />}

      <div className="adm-principal">
        <header className="adm-header">
          <button type="button" className="adm-abrir-menu" onClick={() => setMenuAberto(true)} aria-label="Abrir menu">
            <Menu size={22} />
          </button>
          <div className="adm-header-conta">
            <div className="adm-avatar">{(conta?.nome || 'A').charAt(0).toUpperCase()}</div>
            <div>
              <strong>{conta?.nome || 'Administrador'}</strong>
              <span>{conta?.email}</span>
            </div>
          </div>
        </header>

        <main className="adm-conteudo">
          <Outlet />
        </main>
      </div>

      {confirmarSaida && <div className="adm-modal-overlay" role="presentation">
        <section className="adm-modal adm-modal-confirmacao" role="dialog" aria-modal="true" aria-labelledby="titulo-confirmar-saida">
          <div className="adm-confirmacao-icone"><AlertTriangle size={22} /></div>
          <h2 id="titulo-confirmar-saida">Sair do painel?</h2>
          <p className="adm-texto-suave">Você precisará entrar novamente para acessar as ferramentas administrativas.</p>
          <div className="adm-acoes"><button type="button" className="adm-botao adm-botao-secundario" onClick={() => setConfirmarSaida(false)}>Cancelar</button><button type="button" className="adm-botao adm-botao-perigo adm-botao-perigo-preenchido" onClick={sair}>Sim, sair</button></div>
        </section>
      </div>}
    </div>
  );
}

export default AdminLayout;

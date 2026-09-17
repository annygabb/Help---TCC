import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, MessageSquare, Bell, Search,
  UserPlus, CheckCheck, Mail, Info
} from 'lucide-react';

import './Notificacoes.css';
import logoImg from '../assets/logo.png';
import api from '../services/api';
import useUnreadCounts from './useUnreadCounts';

const iconePorTipo = (tipo) => {
  switch (tipo) {
    case 'NOVO_SEGUIDOR': return <UserPlus size={20} />;
    case 'NOVA_MENSAGEM': return <Mail size={20} />;
    case 'NOVA_VAGA': return <Briefcase size={20} />;
    default: return <Info size={20} />;
  }
};

const Notificacoes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const naoLidas = useUnreadCounts();

  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  const carregarNotificacoes = async () => {
    try {
      const response = await api.get('/notificacoes', { headers: getHeaders() });
      setNotificacoes(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('usuarioLogado')) {
      navigate('/login');
      return;
    }
    carregarNotificacoes();
  }, [navigate]);

  const marcarComoLida = async (notificacao) => {
    if (notificacao.lida) return;
    try {
      await api.put(`/notificacoes/${notificacao.id}/marcar-lida`, {}, { headers: getHeaders() });
      setNotificacoes(prev => prev.map(n => n.id === notificacao.id ? { ...n, lida: true } : n));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      await api.put('/notificacoes/marcar-todas-lidas', {}, { headers: getHeaders() });
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const handleClick = (notificacao) => {
    marcarComoLida(notificacao);
    if (notificacao.tipo === 'NOVA_MENSAGEM') navigate('/mensagens');
    if (notificacao.tipo === 'NOVO_SEGUIDOR') navigate('/configuracao-perfil');
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    const diffMin = Math.floor((new Date() - data) / 60000);

    if (diffMin < 1) return 'agora';
    if (diffMin < 60) return `${diffMin}min atrás`;

    const diffHoras = Math.floor(diffMin / 60);
    if (diffHoras < 24) return `${diffHoras}h atrás`;

    const diffDias = Math.floor(diffHoras / 24);
    if (diffDias < 7) return `${diffDias}d atrás`;

    return data.toLocaleDateString('pt-BR');
  };

  const temNaoLidas = notificacoes.some(n => !n.lida);

  return (
    <div className="notificacoes-container">
      <nav className="user-header">
        <div className="header-inner">
          <div className="header-left">
            <img src={logoImg} alt="Help Logo" className="header-logo" onClick={() => navigate('/feed')} />
            <div className="search-bar">
              <Search size={18} color="#9ca3af" />
              <input type="text" placeholder="Pesquisar..." />
            </div>
          </div>
          <div className="header-right-nav">
            <Link to="/feed" className="nav-item">
              <Home size={22} /><span>Início</span>
            </Link>
            <Link to="/cursos" className="nav-item">
              <BookOpen size={22} /><span>Cursos</span>
            </Link>
            <Link to="/vagas" className="nav-item">
              <Briefcase size={22} /><span>Vagas</span>
            </Link>
            <Link to="/mensagens" className={`nav-item ${location.pathname === '/mensagens' ? 'active' : ''}`}>
              <div className="nav-icon-wrapper">
                <MessageSquare size={22} />
                {naoLidas.mensagens > 0 && <span className="nav-badge">{naoLidas.mensagens}</span>}
              </div>
              <span>Mensagens</span>
            </Link>
            <Link to="/notificacoes" className="nav-item active">
              <Bell size={22} /><span>Notificações</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="notificacoes-main">
        <div className="notificacoes-painel">
          <div className="notificacoes-header">
            <h2>Notificações</h2>
            {temNaoLidas && (
              <button className="marcar-lidas-btn" onClick={marcarTodasComoLidas}>
                <CheckCheck size={16} /> Marcar todas como lidas
              </button>
            )}
          </div>

          {carregando ? (
            <p className="notificacoes-vazio">Carregando...</p>
          ) : notificacoes.length === 0 ? (
            <p className="notificacoes-vazio">Você ainda não tem notificações.</p>
          ) : (
            <div className="notificacoes-lista">
              {notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={`notificacao-item ${!notificacao.lida ? 'nao-lida' : ''}`}
                  onClick={() => handleClick(notificacao)}
                >
                  <div className={`notificacao-icone tipo-${(notificacao.tipo || 'outro').toLowerCase()}`}>
                    {iconePorTipo(notificacao.tipo)}
                  </div>
                  <div className="notificacao-conteudo">
                    <div className="notificacao-titulo">{notificacao.titulo}</div>
                    <div className="notificacao-mensagem">{notificacao.mensagem}</div>
                    <div className="notificacao-data">{formatarData(notificacao.dataCriacao)}</div>
                  </div>
                  {!notificacao.lida && <span className="notificacao-ponto" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notificacoes;

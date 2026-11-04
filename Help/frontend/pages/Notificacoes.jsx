import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, MessageSquare, Bell, Search,
  UserPlus, CheckCheck, Mail, Info
} from 'lucide-react';

import './Notificacoes.css';
import logoImg from '../assets/logo.png';
import { listarNotificacoes, marcarNotificacaoComoLida, marcarTodasNotificacoesComoLidas, resolverDestinoDaNotificacao } from '../services/notificacoes';
import useUnreadCounts from './useUnreadCounts';
import GlobalSearch from '../components/GlobalSearch';

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
  const [filtro, setFiltro] = useState('TODAS');
  const [erro, setErro] = useState('');
  const [marcandoId, setMarcandoId] = useState(null);
  const [marcandoTodas, setMarcandoTodas] = useState(false);

  const mensagemDoErro = (error, padrao) =>
    error?.response?.data?.mensagem || error?.response?.data?.message || error?.response?.data || padrao;

  const atualizarBadge = () => window.dispatchEvent(new Event('help:unread-counts-changed'));

  const carregarNotificacoes = async () => {
    try {
      setErro('');
      setNotificacoes(await listarNotificacoes());
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setErro(mensagemDoErro(error, 'Não foi possível carregar as notificações.'));
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    carregarNotificacoes();
  }, [navigate]);

  const marcarComoLida = async (notificacao) => {
    if (notificacao.lida) return;
    try {
      setMarcandoId(notificacao.id);
      await marcarNotificacaoComoLida(notificacao.id);
      setNotificacoes(prev => prev.map(n => n.id === notificacao.id ? { ...n, lida: true } : n));
      atualizarBadge();
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    } finally {
      setMarcandoId(null);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      setMarcandoTodas(true);
      setErro('');
      await marcarTodasNotificacoesComoLidas();
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
      atualizarBadge();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      setErro(mensagemDoErro(error, 'Não foi possível marcar as notificações como lidas.'));
    } finally {
      setMarcandoTodas(false);
    }
  };

  const handleClick = async (notificacao) => {
    try {
      await marcarComoLida(notificacao);
    } catch (error) {
      setErro(mensagemDoErro(error, 'Não foi possível marcar a notificação como lida.'));
      return;
    }
    const destino = resolverDestinoDaNotificacao(notificacao);
    if (destino) navigate(destino.pathname, { state: destino.state });
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
  const notificacoesFiltradas = filtro === 'NAO_LIDAS' ? notificacoes.filter(n => !n.lida) : notificacoes;
  const hoje = new Date().toDateString();
  const grupos = notificacoesFiltradas.reduce((resultado, notificacao) => {
    const grupo = notificacao.dataCriacao && new Date(notificacao.dataCriacao).toDateString() === hoje ? 'Hoje' : 'Anteriores';
    (resultado[grupo] ||= []).push(notificacao);
    return resultado;
  }, {});

  return (
    <div className="notificacoes-container">
      <nav className="user-header">
        <div className="header-inner">
          <div className="header-left">
            <img src={logoImg} alt="Help Logo" className="header-logo" onClick={() => navigate('/feed')} />
            <GlobalSearch />
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
              <button className="marcar-lidas-btn" onClick={marcarTodasComoLidas} disabled={marcandoTodas}>
                <CheckCheck size={16} /> Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="notificacoes-filtros" aria-label="Filtrar notificações">
            <button className={filtro === 'TODAS' ? 'ativo' : ''} onClick={() => setFiltro('TODAS')}>Todas</button>
            <button className={filtro === 'NAO_LIDAS' ? 'ativo' : ''} onClick={() => setFiltro('NAO_LIDAS')}>Não lidas</button>
          </div>
          {erro && <p className="notificacoes-erro" role="alert">{erro}</p>}
          {carregando ? (
            <p className="notificacoes-vazio">Carregando...</p>
          ) : notificacoesFiltradas.length === 0 ? (
            <p className="notificacoes-vazio">Você ainda não tem notificações.</p>
          ) : (
            <div className="notificacoes-lista">
              {Object.entries(grupos).map(([titulo, itens]) => <section key={titulo} className="notificacoes-grupo"><h3>{titulo}</h3>{itens.map((notificacao) => (
                <div key={notificacao.id} className={`notificacao-item ${!notificacao.lida ? 'nao-lida' : ''} ${marcandoId === notificacao.id ? 'processando' : ''}`} onClick={() => handleClick(notificacao)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') handleClick(notificacao); }} role="button" tabIndex={0} aria-busy={marcandoId === notificacao.id}>
                  <div className={`notificacao-icone tipo-${(notificacao.tipo || 'outro').toLowerCase()}`}>{notificacao.origemFotoUrl ? <img src={notificacao.origemFotoUrl} alt={`Foto de ${notificacao.origemNome || 'conta'}`} /> : notificacao.origemNome?.charAt(0).toUpperCase() || iconePorTipo(notificacao.tipo)}</div>
                  <div className="notificacao-conteudo"><div className="notificacao-titulo">{notificacao.titulo}</div>{notificacao.origemNome && <div className="notificacao-origem">{notificacao.origemNome}</div>}<div className="notificacao-mensagem">{notificacao.mensagem}</div><div className="notificacao-data">{formatarData(notificacao.dataCriacao)}</div></div>
                  {!notificacao.lida && <span className="notificacao-ponto" />}
                </div>
              ))}</section>)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notificacoes;

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, MessageSquare, Bell, Search,
  Send, ArrowLeft, UserPlus, X
} from 'lucide-react';

import './Mensagens.css';
import logoImg from '../assets/logo.png';
import api from '../services/api';
import useUnreadCounts from './useUnreadCounts';

const Mensagens = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const naoLidas = useUnreadCounts();

  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [conversas, setConversas] = useState([]);
  const [conversaAtiva, setConversaAtiva] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [textoNovaMensagem, setTextoNovaMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [modalNovaConversa, setModalNovaConversa] = useState(false);
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);
  const [buscaUsuario, setBuscaUsuario] = useState('');

  const scrollRef = useRef(null);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('usuarioLogado');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    setUsuarioLogado(JSON.parse(savedUser));
  }, [navigate]);

  const carregarConversas = async () => {
    try {
      const response = await api.get('/mensagens/conversas', { headers: getHeaders() });
      setConversas(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (!usuarioLogado) return;
    carregarConversas();
    const intervalo = setInterval(carregarConversas, 8000);
    return () => clearInterval(intervalo);
  }, [usuarioLogado]);

  const carregarConversaAtiva = async (usuarioId) => {
    try {
      const response = await api.get(`/mensagens/conversa/${usuarioId}`, { headers: getHeaders() });
      setMensagens(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
    }
  };

  useEffect(() => {
    if (!conversaAtiva) return;
    carregarConversaAtiva(conversaAtiva.usuarioId);
    const intervalo = setInterval(() => carregarConversaAtiva(conversaAtiva.usuarioId), 5000);
    return () => clearInterval(intervalo);
  }, [conversaAtiva]);

  //desce o scroll quando chega mensagem nova
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  const abrirConversa = (conversa) => {
    setConversaAtiva(conversa);
    //zera o badge na hora
    setConversas(prev => prev.map(c =>
      c.usuarioId === conversa.usuarioId ? { ...c, naoLidas: 0 } : c
    ));
  };

  const enviarMensagem = async (e) => {
    e.preventDefault();
    if (!textoNovaMensagem.trim() || !conversaAtiva) return;

    setEnviando(true);
    try {
      await api.post('/mensagens/enviar', {
        destinatarioId: conversaAtiva.usuarioId,
        conteudo: textoNovaMensagem.trim()
      }, { headers: getHeaders() });

      setTextoNovaMensagem('');
      await carregarConversaAtiva(conversaAtiva.usuarioId);
      await carregarConversas();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Não foi possível enviar a mensagem.');
    } finally {
      setEnviando(false);
    }
  };

  const abrirModalNovaConversa = async () => {
    try {
      const response = await api.get('/usuarios', { headers: getHeaders() });
      const outros = (response.data || []).filter(u => u.id !== usuarioLogado?.id);
      setUsuariosDisponiveis(outros);
      setModalNovaConversa(true);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      alert('Não foi possível carregar a lista de usuários.');
    }
  };

  const iniciarConversaCom = (usuario) => {
    setConversaAtiva({
      usuarioId: usuario.id,
      nome: usuario.name || usuario.nome,
      cargo: usuario.cargo
    });
    setMensagens([]);
    setModalNovaConversa(false);
    setBuscaUsuario('');
  };

  const formatarHora = (dataString) => {
    if (!dataString) return '';
    return new Date(dataString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatarDataConversa = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    if (data.toDateString() === new Date().toDateString()) return formatarHora(dataString);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const usuariosFiltrados = usuariosDisponiveis.filter(u =>
    (u.name || u.nome || '').toLowerCase().includes(buscaUsuario.toLowerCase())
  );

  return (
    <div className="mensagens-container">
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
            <Link to="/mensagens" className="nav-item active">
              <MessageSquare size={22} /><span>Mensagens</span>
            </Link>
            <Link to="/notificacoes" className={`nav-item ${location.pathname === '/notificacoes' ? 'active' : ''}`}>
              <div className="nav-icon-wrapper">
                <Bell size={22} />
                {naoLidas.notificacoes > 0 && <span className="nav-badge">{naoLidas.notificacoes}</span>}
              </div>
              <span>Notificações</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="mensagens-main">
        <div className="mensagens-painel">

          <aside className={`conversas-lista ${conversaAtiva ? 'escondida-mobile' : ''}`}>
            <div className="conversas-header">
              <h2>Mensagens</h2>
              <button className="nova-conversa-btn" onClick={abrirModalNovaConversa} title="Nova conversa">
                <UserPlus size={20} />
              </button>
            </div>

            {carregando ? (
              <p className="mensagens-vazio">Carregando conversas...</p>
            ) : conversas.length === 0 ? (
              <div className="mensagens-vazio-container">
                <p className="mensagens-vazio">Você ainda não tem nenhuma conversa.</p>
                <button className="iniciar-conversa-btn" onClick={abrirModalNovaConversa}>
                  <UserPlus size={18} /> Iniciar conversa
                </button>
              </div>
            ) : (
              conversas.map((conversa) => (
                <div
                  key={conversa.usuarioId}
                  className={`conversa-item ${conversaAtiva?.usuarioId === conversa.usuarioId ? 'ativa' : ''}`}
                  onClick={() => abrirConversa(conversa)}
                >
                  <div className="conversa-avatar">{(conversa.nome || '?').charAt(0).toUpperCase()}</div>
                  <div className="conversa-info">
                    <div className="conversa-linha-topo">
                      <span className="conversa-nome">{conversa.nome}</span>
                      <span className="conversa-hora">{formatarDataConversa(conversa.dataUltimaMensagem)}</span>
                    </div>
                    <div className="conversa-linha-baixo">
                      <span className="conversa-preview">{conversa.ultimaMensagem}</span>
                      {conversa.naoLidas > 0 && <span className="conversa-badge">{conversa.naoLidas}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </aside>

          <section className={`chat-area ${!conversaAtiva ? 'escondida-mobile' : ''}`}>
            {!conversaAtiva ? (
              <div className="chat-vazio">
                <MessageSquare size={48} color="#4b3a6b" />
                <p>Selecione uma conversa para começar</p>
              </div>
            ) : (
              <>
                <div className="chat-header">
                  <button className="voltar-btn-mobile" onClick={() => setConversaAtiva(null)}>
                    <ArrowLeft size={20} />
                  </button>
                  <div className="conversa-avatar">{(conversaAtiva.nome || '?').charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="chat-header-nome">{conversaAtiva.nome}</div>
                    {conversaAtiva.cargo && <div className="chat-header-cargo">{conversaAtiva.cargo}</div>}
                  </div>
                </div>

                <div className="chat-mensagens" ref={scrollRef}>
                  {mensagens.length === 0 ? (
                    <p className="mensagens-vazio">Nenhuma mensagem ainda. Diga oi! 👋</p>
                  ) : (
                    mensagens.map((msg) => (
                      <div
                        key={msg.id}
                        className={`msg-bolha ${msg.remetenteId === usuarioLogado?.id ? 'msg-enviada' : 'msg-recebida'}`}
                      >
                        <p>{msg.conteudo}</p>
                        <span className="msg-hora">{formatarHora(msg.dataEnvio)}</span>
                      </div>
                    ))
                  )}
                </div>

                <form className="chat-input-area" onSubmit={enviarMensagem}>
                  <input
                    type="text"
                    placeholder="Escreva uma mensagem..."
                    value={textoNovaMensagem}
                    onChange={(e) => setTextoNovaMensagem(e.target.value)}
                    disabled={enviando}
                  />
                  <button type="submit" className="enviar-btn" disabled={enviando || !textoNovaMensagem.trim()}>
                    <Send size={20} />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </main>

      {modalNovaConversa && (
        <div className="modal-overlay" onClick={() => setModalNovaConversa(false)}>
          <div className="modal-content-mensagens" onClick={e => e.stopPropagation()}>
            <div className="modal-header-mensagens">
              <h3>Nova conversa</h3>
              <button className="modal-close-btn" onClick={() => setModalNovaConversa(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="search-bar modal-search">
              <Search size={18} color="#9ca3af" />
              <input
                type="text"
                placeholder="Buscar pessoa..."
                value={buscaUsuario}
                onChange={(e) => setBuscaUsuario(e.target.value)}
                autoFocus
              />
            </div>

            <div className="lista-usuarios-modal">
              {usuariosFiltrados.length === 0 ? (
                <p className="mensagens-vazio">Nenhum usuário encontrado.</p>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <div key={usuario.id} className="usuario-modal-item" onClick={() => iniciarConversaCom(usuario)}>
                    <div className="conversa-avatar">
                      {(usuario.name || usuario.nome || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="conversa-nome">{usuario.name || usuario.nome}</div>
                      {usuario.cargo && <div className="chat-header-cargo">{usuario.cargo}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mensagens;

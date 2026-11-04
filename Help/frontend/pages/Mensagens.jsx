import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, MessageSquare, Bell, Search,
  Send, ArrowLeft, UserPlus, X
} from 'lucide-react';

import './Mensagens.css';
import logoImg from '../assets/logo.png';
import { abrirConversaTipada, enviarMensagem as enviarMensagemParaConta, listarContatos, listarConversas } from '../services/comunicacao';
import { obterSessao } from '../services/session';
import useUnreadCounts from './useUnreadCounts';
import GlobalSearch from '../components/GlobalSearch';
import { normalizarContato } from '../utils/contatos';

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
  const [carregandoConversa, setCarregandoConversa] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroConversas, setErroConversas] = useState('');
  const [erroConversa, setErroConversa] = useState('');
  const [erroEnvio, setErroEnvio] = useState('');

  const [modalNovaConversa, setModalNovaConversa] = useState(false);
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);
  const [buscaUsuario, setBuscaUsuario] = useState('');
  const [carregandoContatos, setCarregandoContatos] = useState(false);
  const [erroContatos, setErroContatos] = useState('');

  const scrollRef = useRef(null);

  const mensagemDoErro = (erro, padrao) =>
    erro?.response?.data?.mensagem || erro?.response?.data?.message || erro?.response?.data || padrao;

  useEffect(() => {
    const sessao = obterSessao();
    if (!sessao) {
      navigate('/login');
      return;
    }
    setUsuarioLogado(sessao.conta);
  }, [navigate]);

  useEffect(() => {
    if (!location.state?.iniciarCom) return;
    const contato = normalizarContato(location.state.iniciarCom);
    if (contato) iniciarConversaCom(contato);
    else navigate('/mensagens', { replace: true });
  }, [location.state, navigate]);

  const carregarConversas = async () => {
    setErroConversas('');
    try {
      setConversas(await listarConversas());
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      setErroConversas(mensagemDoErro(error, 'Não foi possível carregar suas conversas.'));
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

  const carregarConversaAtiva = async (contaId, tipoConta) => {
    setCarregandoConversa(true);
    setErroConversa('');
    try {
      const contato = normalizarContato({ contaId, tipoConta });
      if (!contato) return;
      setMensagens(await abrirConversaTipada(contato));
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
      setErroConversa(mensagemDoErro(error, 'Não foi possível carregar esta conversa.'));
    } finally {
      setCarregandoConversa(false);
    }
  };

  useEffect(() => {
    if (!conversaAtiva) return;
    carregarConversaAtiva(conversaAtiva.contaId, conversaAtiva.tipoConta);
    const intervalo = setInterval(() => carregarConversaAtiva(conversaAtiva.contaId, conversaAtiva.tipoConta), 5000);
    return () => clearInterval(intervalo);
  }, [conversaAtiva]);

  //desce o scroll quando chega mensagem nova
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  const abrirConversa = (conversa) => {
    const contato = normalizarContato(conversa);
    if (!contato) return;
    setConversaAtiva(contato);
    //zera o badge na hora
    setConversas(prev => prev.map(c =>
      c.contaId === contato.contaId && c.tipoConta === contato.tipoConta ? { ...c, naoLidas: 0 } : c
    ));
  };

  const enviarMensagem = async (e) => {
    e.preventDefault();
    if (!textoNovaMensagem.trim() || !conversaAtiva) return;

    setEnviando(true);
    setErroEnvio('');
    try {
      await enviarMensagemParaConta(conversaAtiva, textoNovaMensagem);

      setTextoNovaMensagem('');
      await carregarConversaAtiva(conversaAtiva.contaId, conversaAtiva.tipoConta);
      await carregarConversas();
      window.dispatchEvent(new Event('help:unread-counts-changed'));
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setErroEnvio(mensagemDoErro(error, 'Não foi possível enviar a mensagem. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  };

  const abrirModalNovaConversa = async () => {
    setCarregandoContatos(true);
    setErroContatos('');
    try {
      setUsuariosDisponiveis(await listarContatos());
      setModalNovaConversa(true);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setErroContatos(mensagemDoErro(error, 'Não foi possível carregar a lista de contatos.'));
      setModalNovaConversa(true);
    } finally {
      setCarregandoContatos(false);
    }
  };

  const iniciarConversaCom = (usuario) => {
    const contato = normalizarContato(usuario);
    if (!contato) return;
    setConversaAtiva({ ...contato, subtitulo: contato.subtitulo || contato.cargo });
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

  const normalizarBusca = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const usuariosFiltrados = usuariosDisponiveis.filter(u =>
    normalizarBusca(u.name || u.nome).includes(normalizarBusca(buscaUsuario))
  );

  return (
    <div className="mensagens-container">
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
            ) : erroConversas ? (
              <div className="mensagens-vazio-container" role="alert"><p className="mensagens-vazio">{erroConversas}</p><button className="iniciar-conversa-btn" onClick={carregarConversas}>Tentar novamente</button></div>
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
                  key={`${conversa.tipoConta}:${conversa.contaId}`}
                  className={`conversa-item ${conversaAtiva?.contaId === conversa.contaId && conversaAtiva?.tipoConta === conversa.tipoConta ? 'ativa' : ''}`}
                  onClick={() => abrirConversa(conversa)}
                >
                  <div className="conversa-avatar">
                    {conversa.fotoUrl ? <img src={conversa.fotoUrl} alt="" /> : (conversa.nome || '?').charAt(0).toUpperCase()}
                  </div>
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
                  <div className="conversa-avatar">
                    {conversaAtiva.fotoUrl ? <img src={conversaAtiva.fotoUrl} alt="" /> : (conversaAtiva.nome || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="chat-header-nome">{conversaAtiva.nome}</div>
                    {conversaAtiva.subtitulo && <div className="chat-header-cargo">{conversaAtiva.subtitulo}</div>}
                  </div>
                </div>

                <div className="chat-mensagens" ref={scrollRef}>
                  {carregandoConversa ? (
                    <p className="mensagens-vazio">Carregando conversa...</p>
                  ) : erroConversa ? (
                    <div className="mensagens-vazio-container" role="alert"><p className="mensagens-vazio">{erroConversa}</p><button className="iniciar-conversa-btn" onClick={() => carregarConversaAtiva(conversaAtiva.contaId, conversaAtiva.tipoConta)}>Tentar novamente</button></div>
                  ) : mensagens.length === 0 ? (
                    <p className="mensagens-vazio">Nenhuma mensagem ainda. Diga oi! 👋</p>
                  ) : (
                    mensagens.map((msg) => (
                      <div
                        key={msg.id}
                        className={`msg-bolha ${msg.remetenteId === usuarioLogado?.id && (msg.remetenteTipo || 'USUARIO') === (usuarioLogado?.tipoConta === 'EMPRESA' ? 'EMPRESA' : 'USUARIO') ? 'msg-enviada' : 'msg-recebida'}`}
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
                {erroEnvio && <div className="mensagens-erro" role="alert">{erroEnvio} <button type="button" onClick={enviarMensagem} disabled={enviando || !textoNovaMensagem.trim()}>Reenviar</button></div>}
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
              {carregandoContatos ? (
                <p className="mensagens-vazio">Carregando contatos...</p>
              ) : erroContatos ? (
                <div className="mensagens-vazio-container" role="alert"><p className="mensagens-vazio">{erroContatos}</p><button className="iniciar-conversa-btn" onClick={abrirModalNovaConversa}>Tentar novamente</button></div>
              ) : usuariosFiltrados.length === 0 ? (
                <p className="mensagens-vazio">Nenhum usuário encontrado.</p>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <div key={`${usuario.tipoConta}:${usuario.id}`} className="usuario-modal-item" onClick={() => iniciarConversaCom(usuario)}>
                    <div className="conversa-avatar">
                      {usuario.fotoUrl ? <img src={usuario.fotoUrl} alt="" /> : (usuario.name || usuario.nome || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="conversa-nome">{usuario.name || usuario.nome}</div>
                      {(usuario.subtitulo || usuario.cargo) && <div className="chat-header-cargo">{usuario.subtitulo || usuario.cargo}</div>}
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

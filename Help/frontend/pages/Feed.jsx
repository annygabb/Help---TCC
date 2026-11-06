import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, MessageSquare, Bell, Search, ShieldCheck,
  Share2, ThumbsUp, MessageCircle, Image, Video, MapPin, Users, Flag
} from 'lucide-react';
import './Feed.css';
import './Badges.css';
import logoImg from '../assets/logo.png';
import CriarPublicacao from './CriarPublicacao';
import useUnreadCounts from './useUnreadCounts';
import GlobalSearch from '../components/GlobalSearch';
import api from '../services/api';
import { deixarDeSeguir, consultarStatus, seguir } from '../services/seguidores';
import { deduplicarPublicacoes } from '../utils/feed';
import DenunciaModal from '../components/DenunciaModal';
import { avatarPadrao } from '../utils/avatar';

const Feed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const naoLidas = useUnreadCounts();

  const [user, setUser] = useState({
    name: '',
    role: '',
    company: '',
    location: '',
    photoUrl: null,
    tipoConta: ''
  });

  const [posts, setPosts] = useState([]);
  const [carregandoPosts, setCarregandoPosts] = useState(true);
  const [contaAtual, setContaAtual] = useState(null);
  const [atualizandoAutor, setAtualizandoAutor] = useState(null);
  const [erroSocial, setErroSocial] = useState('');
  const [curtidas, setCurtidas] = useState(() => new Set());
  const [comentarioAberto, setComentarioAberto] = useState(null);
  const [novoComentario, setNovoComentario] = useState('');
  const [comentarios, setComentarios] = useState({});
  const [compartilhadoId, setCompartilhadoId] = useState(null);
  const [postDenunciado, setPostDenunciado] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('usuarioLogado');
    const token = localStorage.getItem('token');

    if (!savedUser || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    setContaAtual({
      contaId: parsedUser.id,
      tipoConta: parsedUser.tipoConta === 'EMPRESA' ? 'EMPRESA' : 'USUARIO'
    });
    setUser({
      name: parsedUser.nome || parsedUser.name || '',
      role: parsedUser.cargo || '',
      company: '',
      location: parsedUser.localidade || '',
      photoUrl: parsedUser.fotoPerfil || parsedUser.fotoUrl || null,
      tipoConta: parsedUser.tipoConta || 'CANDIDATO'
    });

    let ativo = true;
    const tipoConta = parsedUser.tipoConta;
    api.get(tipoConta === 'EMPRESA' ? '/empresas/me' : '/perfis/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(({ data }) => {
      if (!ativo) return;
      if (tipoConta === 'EMPRESA') {
        setUser({ name: data.razaoSocial || '', role: 'Empresa', company: '', location: '', photoUrl: data.fotoUrl || null, tipoConta: 'EMPRESA' });
        return;
      }
      const empregoAtual = (data.experiencias || []).find((experiencia) => experiencia.trabalhaAtualmente);

      setUser({
        name: data.nome || '',
        role: data.cargo || '',
        company: empregoAtual?.empresa || '',
        location: data.localidade || '',
        photoUrl: data.fotoUrl || null,
        tipoConta: parsedUser.tipoConta || 'CANDIDATO'
      });
    }).catch((error) => {
      console.error('Erro ao carregar perfil no feed:', error);
    });

    api.get('/publicacoes').then(async ({ data }) => {
      const publicacoes = deduplicarPublicacoes(data || []);
      const autores = [...new Map(publicacoes.map((post) => [
        `${post.autorTipo}:${post.autorId}`,
        { contaId: post.autorId, tipoConta: post.autorTipo }
      ])).values()];
      const status = await Promise.all(autores.map(async (autor) => {
        try { return [`${autor.tipoConta}:${autor.contaId}`, await consultarStatus(autor)]; }
        catch { return [`${autor.tipoConta}:${autor.contaId}`, false]; }
      }));
      const seguindoPorAutor = new Map(status);
      if (ativo) setPosts(publicacoes.map((post) => ({
        ...post,
        seguindoAutor: seguindoPorAutor.get(`${post.autorTipo}:${post.autorId}`) || false
      })));
    }).catch((error) => console.error('Erro ao carregar publicações:', error))
      .finally(() => { if (ativo) setCarregandoPosts(false); });

    return () => {
      ativo = false;
    };
  }, [navigate]);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'agora';
    const now = new Date();
    const past = new Date(dateString);
    if (Number.isNaN(past.getTime())) return 'agora';
    const diffInSeconds = Math.floor((now - past) / 1000);
    if (diffInSeconds < 0) return 'agora';
    if (diffInSeconds < 60) return `${diffInSeconds}seg`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const handleNewPost = async (texto, midia, config) => {
    try {
      const midiaUrl = midia?.file ? await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(midia.file);
      }) : null;
      const permissoes = ['TODOS', 'SEGUIDORES', 'DESATIVADO'];
      const { data } = await api.post('/publicacoes', {
        conteudo: texto,
        midiaUrl,
        midiaTipo: midia?.tipo || null,
        permissaoComentario: permissoes[config?.comentarioStatus ?? 0],
        visibilidade: config?.visibilidade || 'TODOS'
      });
      setPosts((anteriores) => [data, ...anteriores.filter((post) => post.id !== data.id)]);
      setIsModalOpen(false);
    } catch (error) {
      const dados = error.response?.data;
      alert(dados?.mensagem || dados?.message || dados?.error || (typeof dados === 'string' ? dados : 'Não foi possível publicar.'));
    }
  };

  const alternarCurtida = (postId) => {
    setCurtidas((anteriores) => {
      const atualizadas = new Set(anteriores);
      if (atualizadas.has(postId)) atualizadas.delete(postId);
      else atualizadas.add(postId);
      return atualizadas;
    });
  };

  const abrirComentarios = (postId) => {
    setComentarioAberto((aberto) => aberto === postId ? null : postId);
    setNovoComentario('');
  };

  const enviarComentario = (event, postId) => {
    event.preventDefault();
    const conteudo = novoComentario.trim();
    if (!conteudo) return;
    setComentarios((anteriores) => ({
      ...anteriores,
      [postId]: [...(anteriores[postId] || []), { id: crypto.randomUUID(), autor: displayName, conteudo }]
    }));
    setNovoComentario('');
  };

  const compartilharPublicacao = async (postId) => {
    const url = `${window.location.origin}${window.location.pathname}#/feed?publicacao=${postId}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Publicação no HELP', url });
      else await navigator.clipboard.writeText(url);
      setCompartilhadoId(postId);
      window.setTimeout(() => setCompartilhadoId(null), 2500);
    } catch (error) {
      if (error.name !== 'AbortError') alert('Não foi possível compartilhar esta publicação.');
    }
  };

  const avatarStyle = { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' };
  const displayName = user.name?.trim() || 'Usuário';
  const profileImage = user.photoUrl || avatarPadrao(displayName);
  const contaDoAutor = (post) => ({ contaId: post.autorId, tipoConta: post.autorTipo, nome: post.autorNome, subtitulo: post.autorSubtitulo, fotoUrl: post.autorFotoUrl });
  const autorEhContaAtual = (post) => contaAtual?.contaId === post.autorId && contaAtual?.tipoConta === post.autorTipo;
  const mensagemDoErro = (error, padrao) => error?.response?.data?.mensagem || error?.response?.data?.message || (typeof error?.response?.data === 'string' ? error.response.data : padrao);

  const alternarSeguimentoDoAutor = async (post) => {
    if (autorEhContaAtual(post) || atualizandoAutor) return;
    const autor = contaDoAutor(post);
    const chave = `${autor.tipoConta}:${autor.contaId}`;
    setAtualizandoAutor(chave);
    setErroSocial('');
    try {
      if (post.seguindoAutor) await deixarDeSeguir(autor);
      else await seguir(autor);
      setPosts((anteriores) => anteriores.map((item) =>
        item.autorId === post.autorId && item.autorTipo === post.autorTipo
          ? { ...item, seguindoAutor: !post.seguindoAutor }
          : item
      ));
      window.dispatchEvent(new Event('help:unread-counts-changed'));
    } catch (error) {
      setErroSocial(mensagemDoErro(error, 'Não foi possível atualizar o seguimento.'));
    } finally {
      setAtualizandoAutor(null);
    }
  };

  return (
    <div className="feed-container">
      <nav className="user-header">
        <div className="header-inner">
          <div className="header-left">
            <img src={logoImg} alt="Help Logo" className="header-logo" onClick={() => navigate('/')} />
            <GlobalSearch />
          </div>
          <div className="header-right-nav">
            <Link to="/feed" className={`nav-item ${location.pathname === '/feed' ? 'active' : ''}`}>
              <Home size={22} />
              <span>Início</span>
            </Link>
            <Link to="/cursos" className={`nav-item ${location.pathname === '/cursos' ? 'active' : ''}`}>
              <BookOpen size={22} />
              <span>Cursos</span>
            </Link>
            <Link to="/vagas" className={`nav-item ${location.pathname === '/vagas' ? 'active' : ''}`}>
              <Briefcase size={22} />
              <span>Vagas</span>
            </Link>
            <Link to="/mensagens" className={`nav-item ${location.pathname === '/mensagens' ? 'active' : ''}`}>
              <div className="nav-icon-wrapper">
                <MessageSquare size={22} />
                {naoLidas.mensagens > 0 && <span className="nav-badge">{naoLidas.mensagens}</span>}
              </div>
              <span>Mensagens</span>
            </Link>
            <Link to="/notificacoes" className={`nav-item ${location.pathname === '/notificacoes' ? 'active' : ''}`}>
              <div className="nav-icon-wrapper">
                <Bell size={22} />
                {naoLidas.notificacoes > 0 && <span className="nav-badge">{naoLidas.notificacoes}</span>}
              </div>
              <span>Notificações</span>
            </Link>
            {user.tipoConta === 'ADMIN' && (
              <Link to="/admin" className={`nav-item ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
                <ShieldCheck size={22} />
                <span>Painel admin</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="feed-content">
<aside className="left-column">
  <div
    className="profile-card-dark"
    onClick={() => navigate(user.tipoConta === 'EMPRESA' ? '/dashboard-rh' : '/configuracao-perfil')}
    style={{
      cursor: 'pointer',
      padding: '20px'
    }}
  >
    <div className="profile-header-info" style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '5px' }}>
      <div
        className="avatar-preview-small"
        style={{
          position: 'relative',
          width: '70px',
          height: '70px',
          backgroundImage: 'none'
        }}
      >
        <div style={{
          position: 'absolute',
          inset: '-3px',
          borderRadius: '18px',
          background: 'linear-gradient(45deg, #a755f7, #6366f1)',
          zIndex: 0
        }}></div>

        <img
          src={profileImage}
          alt="Perfil"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '15px',
            objectFit: 'cover',
            position: 'relative',
            zIndex: 1,
            border: '3px solid #121217'
          }}
        />
      </div>

      <div className="user-details-text">
        <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '700' }}>
          {displayName}
        </h3>
        <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0' }}>
          {user.role || 'Perfil profissional'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={12} color="#9ca3af" />
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{user.location}</span>
        </div>
      </div>
    </div>

    {user.company && (
      <>
        <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '20px 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Briefcase size={22} color="#a755f7" aria-hidden="true" />
          <span style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>
            {user.company}
          </span>
        </div>
      </>
    )}
  </div>
</aside>

        <section className="main-column">
          <div className="create-post-container">
            <div className="post-input-row">
              <div className="avatar-mini">
                <img src={profileImage} alt="Eu" style={avatarStyle} />
              </div>
              <button className="post-input-field-trigger" onClick={() => setIsModalOpen(true)}>
                Começar publicação
              </button>
            </div>
            <div className="post-actions-row">
              <button className="action-item" onClick={() => setIsModalOpen(true)}>
                <Video size={20} color="#70b5f9" /><span>Vídeo</span>
              </button>
              <button className="action-item" onClick={() => setIsModalOpen(true)}>
                <Image size={20} color="#7fc15e" /><span>Foto</span>
              </button>
            </div>
          </div>

          {carregandoPosts && <p className="feed-state">Carregando publicações...</p>}
          {!carregandoPosts && posts.length === 0 && <p className="feed-state">Ainda não há publicações. Seja a primeira conta a publicar.</p>}
          {erroSocial && <p className="feed-social-error" role="alert">{erroSocial}</p>}
          {posts.map(post => {
            const isOff = post.permissaoComentario === 'DESATIVADO';
            const isOnlyFollowers = post.permissaoComentario === 'SEGUIDORES';
            const canUserComment = post.podeComentar;
            const usuarioCurtiu = curtidas.has(post.id);
            const comentariosDoPost = comentarios[post.id] || [];

            return (
              <div className="post" key={post.id}>
                <div className="post-header">
                  <button className="post-author-button" onClick={() => navigate(`/perfil/${post.autorTipo}/${post.autorId}`)} aria-label={`Abrir perfil de ${post.autorNome}`}>
                  <div className="avatar-mini">
                    <img src={post.autorFotoUrl || avatarPadrao(post.autorNome)} alt="Autor" style={avatarStyle} />
                  </div>
                  <div className="post-info">
                    <h4>{post.autorNome}</h4>
                    <span>{post.autorSubtitulo || (post.autorTipo === 'EMPRESA' ? 'Empresa' : 'Usuário')} • {formatTimeAgo(post.criadaEm)}</span>
                  </div>
                  </button>
                  {!autorEhContaAtual(post) && <div className="post-social-actions">
                    <button onClick={() => alternarSeguimentoDoAutor(post)} disabled={atualizandoAutor === `${post.autorTipo}:${post.autorId}`}>
                      {atualizandoAutor === `${post.autorTipo}:${post.autorId}` ? 'Atualizando...' : post.seguindoAutor ? 'Seguindo' : 'Seguir'}
                    </button>
                    <button onClick={() => navigate('/mensagens', { state: { iniciarCom: contaDoAutor(post) } })}>Mensagem</button>
                  </div>}
                </div>
                <div className="post-body">
                  <p>{post.conteudo}</p>
                  {post.midiaUrl && (
                     <div className="post-media-content">
                        {post.midiaTipo === 'image' ? <img src={post.midiaUrl} alt="Post" /> : <video src={post.midiaUrl} controls />}
                     </div>
                  )}
                </div>

                <div className="post-actions">
                  <button className={`action-btn ${usuarioCurtiu ? 'active' : ''}`} onClick={() => alternarCurtida(post.id)}>
                    <ThumbsUp size={18} fill={usuarioCurtiu ? 'currentColor' : 'none'} /> {usuarioCurtiu ? 'Curtido' : 'Gostei'}
                  </button>

                  {canUserComment && (
                    <button className={`action-btn ${comentarioAberto === post.id ? 'active' : ''}`} onClick={() => abrirComentarios(post.id)}>
                      <MessageCircle size={18} /> Comentar{comentariosDoPost.length ? ` (${comentariosDoPost.length})` : ''}
                    </button>
                  )}

                  {isOnlyFollowers && !canUserComment && (
                    <div className="comment-restricted-info">
                       <Users size={14} /> <span>Apenas seguidores podem comentar</span>
                    </div>
                  )}

                  {isOff && <div className="comment-restricted-info"><span>Comentários desativados</span></div>}

                  <button className="action-btn" onClick={() => compartilharPublicacao(post.id)}>
                    <Share2 size={18} /> {compartilhadoId === post.id ? 'Link copiado' : 'Compartilhar'}
                  </button>
                  {!autorEhContaAtual(post) && <button className="action-btn" onClick={() => setPostDenunciado(post)}><Flag size={18} /> Denunciar</button>}
                </div>

                {comentarioAberto === post.id && canUserComment && (
                  <div className="comments-panel">
                    {comentariosDoPost.map((comentario) => (
                      <div className="comment-item" key={comentario.id}>
                        <strong>{comentario.autor}</strong>
                        <span>{comentario.conteudo}</span>
                      </div>
                    ))}
                    <form onSubmit={(event) => enviarComentario(event, post.id)} className="comment-form">
                      <input
                        value={novoComentario}
                        onChange={(event) => setNovoComentario(event.target.value)}
                        placeholder="Escreva um comentário"
                        aria-label="Novo comentário"
                      />
                      <button type="submit">Enviar</button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <aside className="right-column">
          {user.tipoConta === 'EMPRESA' ? (
            <div className="rec-card">
              <h4>Gestão de vagas</h4>
              <div className="rec-item"><strong>Publique e acompanhe suas vagas</strong></div>
              <button className="view-all" onClick={() => navigate('/dashboard-rh')}>Abrir painel da empresa</button>
            </div>
          ) : (
            <div className="rec-card">
              <h4>Vagas Recomendadas</h4>
              <div className="rec-item"><strong>Desenvolvedor Java</strong><span>Anápolis, GO</span></div>
              <button className="view-all" onClick={() => navigate('/vagas')}>Ver todas as vagas</button>
            </div>
          )}
        </aside>
      </main>

      {isModalOpen && (
        <CriarPublicacao
          onClose={() => setIsModalOpen(false)}
          onPublish={handleNewPost}
          user={{
            nome: displayName,
            fotoPerfil: profileImage
          }}
        />
      )}
      {postDenunciado && <DenunciaModal alvoTipo="PUBLICACAO" alvoId={postDenunciado.id} alvoNome={`publicação de ${postDenunciado.autorNome}`} onClose={() => setPostDenunciado(null)} />}
    </div>
  );
};

export default Feed;

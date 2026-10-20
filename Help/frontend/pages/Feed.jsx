import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, MessageSquare, Bell, Search,
  Share2, ThumbsUp, MessageCircle, Image, Video, MapPin, Users
} from 'lucide-react';
import './Feed.css';
import './Badges.css';
import logoImg from '../assets/logo.png';
import defaultProfileImg from '../assets/fotoperfil.png';
import CriarPublicacao from './CriarPublicacao';
import useUnreadCounts from './useUnreadCounts';
import api from '../services/api';

const Feed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const naoLidas = useUnreadCounts();

  const [isSeguidorDoAutor] = useState(true);

  const [user, setUser] = useState({
    name: '',
    role: '',
    company: '',
    location: '',
    photoUrl: null
  });

  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Help - Plataforma de Carreiras",
      role: "Promovido",
      content: "Bem-vinda ao seu novo ecossistema profissional! Explore vagas e cursos voltados para Engenharia de Software.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isPromoted: true,
      comentarioStatus: 0
    }
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('usuarioLogado');
    const token = localStorage.getItem('token');

    if (!savedUser || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    setUser({
      name: parsedUser.nome || parsedUser.name || '',
      role: parsedUser.cargo || '',
      company: '',
      location: parsedUser.localidade || '',
      photoUrl: parsedUser.fotoPerfil || null
    });

    let ativo = true;
    api.get('/perfis/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(({ data }) => {
      if (!ativo) return;
      const empregoAtual = (data.experiencias || []).find((experiencia) => experiencia.trabalhaAtualmente);

      setUser({
        name: data.nome || '',
        role: data.cargo || '',
        company: empregoAtual?.empresa || '',
        location: data.localidade || '',
        photoUrl: data.fotoUrl || null
      });
    }).catch((error) => {
      console.error('Erro ao carregar perfil no feed:', error);
    });

    return () => {
      ativo = false;
    };
  }, [navigate]);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}seg`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  const handleNewPost = (texto, midia, config) => {
    const newPost = {
      id: Date.now(),
      author: user.name,
      role: user.company ? `${user.role} na ${user.company}` : user.role,
      content: texto,
      midia: midia,
      timestamp: new Date().toISOString(),
      isPromoted: false,
      comentarioStatus: config?.comentarioStatus ?? 0,
      privacidade: config?.privacidadePost ?? 'todos'
    };

    setPosts([newPost, ...posts]);
    setIsModalOpen(false);
  };

  const avatarStyle = { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' };
  const profileImage = user.photoUrl || defaultProfileImg;
  const displayName = user.name?.trim() || 'Usuário';

  return (
    <div className="feed-container">
      <nav className="user-header">
        <div className="header-inner">
          <div className="header-left">
            <img src={logoImg} alt="Help Logo" className="header-logo" onClick={() => navigate('/')} />
            <div className="search-bar">
              <Search size={18} color="#9ca3af" />
              <input type="text" placeholder="Pesquisar..." />
            </div>
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
          </div>
        </div>
      </nav>

      <main className="feed-content">
<aside className="left-column">
  <div
    className="profile-card-dark"
    onClick={() => navigate('/configuracao-perfil')}
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

          {posts.map(post => {
            const isOff = post.comentarioStatus === 2;
            const isOnlyFollowers = post.comentarioStatus === 1;
            const canUserComment = !isOff && (isOnlyFollowers ? isSeguidorDoAutor : true);

            return (
              <div className="post" key={post.id}>
                <div className="post-header">
                  <div className="avatar-mini">
                    <img src={post.isPromoted ? logoImg : profileImage} alt="Autor" style={avatarStyle} />
                  </div>
                  <div className="post-info">
                    <h4>{post.author}</h4>
                    <span>{post.role} • {post.isPromoted ? 'Promovido' : formatTimeAgo(post.timestamp)}</span>
                  </div>
                </div>
                <div className="post-body">
                  <p>{post.content}</p>
                  {post.midia && post.midia.preview && (
                     <div className="post-media-content">
                        {post.midia.tipo === 'image' ? <img src={post.midia.preview} alt="Post" /> : <video src={post.midia.preview} controls />}
                     </div>
                  )}
                </div>

                <div className="post-actions">
                  <button className="action-btn"><ThumbsUp size={18} /> Gostei</button>

                  {canUserComment && (
                    <button className="action-btn"><MessageCircle size={18} /> Comentar</button>
                  )}

                  {isOnlyFollowers && !isSeguidorDoAutor && (
                    <div className="comment-restricted-info">
                       <Users size={14} /> <span>Apenas seguidores podem comentar</span>
                    </div>
                  )}

                  <button className="action-btn"><Share2 size={18} /> Compartilhar</button>
                </div>
              </div>
            );
          })}
        </section>

        <aside className="right-column">
          <div className="rec-card">
            <h4>Vagas Recomendadas</h4>
            <div className="rec-item"><strong>Desenvolvedor Java</strong><span>Anápolis, GO</span></div>
            <button className="view-all" onClick={() => navigate('/vagas')}>Ver todas as vagas</button>
          </div>
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
    </div>
  );
};

export default Feed;
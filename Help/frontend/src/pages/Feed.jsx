import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, MessageSquare, Bell, Search,
  Share2, ThumbsUp, MessageCircle, Image, Video, MapPin, Users
} from 'lucide-react';
import './Feed.css';
import logoImg from '../assets/logo.png';
import nttLogo from '../assets/ntt-logo.jpg';
import userProfileImg from '../assets/fotoperfil.png';
import CriarPublicacao from './CriarPublicacao';

const Feed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isSeguidorDoAutor] = useState(true);

  const [user, setUser] = useState({
    name: "Anny Gabrielly Gonçalves de Oliveira",
    role: "Analista de Sistemas",
    company: "NTT DATA",
    location: "Silvânia, Goiás"
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
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser({
        name: parsedUser.nome || user.name,
        role: parsedUser.cargo || user.role,
        company: parsedUser.empresa || user.company,
        location: parsedUser.localidade || user.location
      });
    }
  }, [user.name, user.role, user.company, user.location]);

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
      role: `${user.role} na ${user.company}`,
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
            <div className="nav-item"><MessageSquare size={22} /><span>Mensagens</span></div>
            <div className="nav-item"><Bell size={22} /><span>Notificações</span></div>
          </div>
        </div>
      </nav>

      <main className="feed-content">
        <aside className="left-column">
          <div className="profile-card-dark" onClick={() => navigate('/configuracao-perfil')}>
            <div className="profile-header-info">
              <div className="avatar-preview-small">
                <img src={userProfileImg} alt="Perfil" style={avatarStyle} />
              </div>
              <div className="user-details-text">
                <h3>{user.name.split(' ')[0]} {user.name.split(' ')[1]}</h3>
                <p className="bio-text">{user.role} | Engenharia de Software</p>
                <div className="location-info">
                  <MapPin size={12} />
                  <span className="location-text">{user.location}</span>
                </div>
              </div>
            </div>
            <div className="company-info-row">
              <div className="company-logo-box"><img src={nttLogo} alt="NTT DATA" /></div>
              <span className="company-name">{user.company}</span>
            </div>
          </div>
        </aside>

        <section className="main-column">
          <div className="create-post-container">
            <div className="post-input-row">
              <div className="avatar-mini">
                <img src={userProfileImg} alt="Eu" style={avatarStyle} />
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
                    <img src={post.isPromoted ? logoImg : userProfileImg} alt="Autor" style={avatarStyle} />
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
            nome: user.name,
            fotoPerfil: userProfileImg
          }}
        />
      )}
    </div>
  );
};

export default Feed;
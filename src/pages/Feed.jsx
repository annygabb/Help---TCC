import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, MessageSquare, Bell, Search,
  Share2, ThumbsUp, MessageCircle, Image, Video, MapPin,
  X, Smile, Calendar, Award, Plus, Clock, ChevronDown, Globe
} from 'lucide-react';
import './Feed.css';
import logoImg from '../assets/logo.png';
import nttLogo from '../assets/ntt-logo.jpg';
import userProfileImg from '../assets/perfil.jpg';

const Feed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postText, setPostText] = useState('');
  const [visibility, setVisibility] = useState('Todos');
  const [commentLevel, setCommentLevel] = useState('Todos');

  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Help - Plataforma de Carreiras",
      role: "Promovido",
      content: "Bem-vinda ao seu novo ecossistema profissional! Explore vagas e cursos voltados para Engenharia de Software.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isPromoted: true
    }
  ]);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}seg`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return `${Math.floor(diffInHours / 168)}sem`;
  };

  const handlePublish = () => {
    if (!postText.trim()) return;

    const newPost = {
      id: Date.now(),
      author: "Anny Gabrielly Gonçalves de Oliveira",
      role: "Analista de Sistemas na NTT DATA",
      content: postText,
      timestamp: new Date().toISOString(),
      isPromoted: false,
      visibility: visibility
    };

    setPosts([newPost, ...posts]);
    setPostText('');
    setIsModalOpen(false);
  };

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
            <div className="nav-item">
              <MessageSquare size={22} />
              <span>Mensagens</span>
            </div>
            <div className="nav-item">
              <Bell size={22} />
              <span>Notificações</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="feed-content">
        <aside className="left-column">
          <div className="profile-card-dark" onClick={() => navigate('/configuracao-perfil')}>
            <div className="profile-header-info">
              <div className="avatar-preview-small"></div>
              <div className="user-details-text">
                <h3>Anny Gabrielly Go...</h3>
                <p className="bio-text">Analista de Sistemas | Engenharia de Software</p>
                <div className="location-info">
                  <MapPin size={12} />
                  <span className="location-text">Silvânia, Goiás</span>
                </div>
              </div>
            </div>
            <div className="company-info-row">
              <div className="company-logo-box"><img src={nttLogo} alt="NTT DATA" /></div>
              <span className="company-name">NTT DATA</span>
            </div>
          </div>
        </aside>

        <section className="main-column">
          <div className="create-post-container">
            <div className="post-input-row">
              <div className="avatar-mini"></div>
              <button className="post-input-field-trigger" onClick={() => setIsModalOpen(true)}>
                Começar publicação
              </button>
            </div>
            <div className="post-actions-row">
              <button className="action-item"><Video size={20} color="#70b5f9" /><span>Vídeo</span></button>
              <button className="action-item"><Image size={20} color="#7fc15e" /><span>Foto</span></button>
            </div>
          </div>

          {posts.map(post => (
            <div className="post" key={post.id}>
              <div className="post-header">
                <div className="avatar-mini"></div>
                <div className="post-info">
                  <h4>{post.author}</h4>
                  <span>{post.role} • {post.isPromoted ? 'Promovido' : formatTimeAgo(post.timestamp)}</span>
                </div>
              </div>
              <div className="post-body">
                <p>{post.content}</p>
              </div>
              <div className="post-actions">
                <button><ThumbsUp size={18} /> Gostei</button>
                <button><MessageCircle size={18} /> Comentar</button>
                <button><Share2 size={18} /> Compartilhar</button>
              </div>
            </div>
          ))}
        </section>

        <aside className="right-column">
          <div className="rec-card">
            <h4>Vagas Recomendadas</h4>
            <div className="rec-item">
              <strong>Desenvolvedor Java</strong>
              <span>Anápolis, GO</span>
            </div>
            <button className="view-all" onClick={() => navigate('/vagas')}>Ver todas as vagas</button>
          </div>
        </aside>
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card-white dark-variant">
            <div className="modal-header-white">
              <div className="modal-user-top">
                <img src={userProfileImg} alt="perfil" className="avatar-modal" />
                <div className="user-select-configs">
                  <h4>Anny Gabrielly Gonçalves de...</h4>
                  <div className="selectors-container">
                    <div className="select-pill">
                      <Globe size={14} />
                      <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                        <option value="Todos">Publicar para todos</option>
                        <option value="Seguidores">Apenas quem você segue</option>
                      </select>
                      <ChevronDown size={14} />
                    </div>

                    <div className="select-pill">
                      <MessageCircle size={14} />
                      <select value={commentLevel} onChange={(e) => setCommentLevel(e.target.value)}>
                        <option value="Todos">Todos podem comentar</option>
                        <option value="Alguns">Apenas seguidores</option>
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>
              </div>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body-white">
              <textarea
                placeholder="Sobre o que você quer falar?"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                autoFocus
              />
              <button className="emoji-picker-btn"><Smile size={24} /></button>
            </div>

            <div className="modal-footer-white">
              <div className="footer-left-tools">
                <button title="Adicionar Foto"><Image size={22} /></button>
                <button title="Agendar"><Calendar size={22} /></button>
                <button title="Certificação"><Award size={22} /></button>
                <button title="Mais"><Plus size={22} /></button>
              </div>
              <div className="footer-right-actions">
                <button className="timer-btn"><Clock size={22} /></button>
                <button
                  className={`btn-publish-final ${postText.trim() ? 'enabled' : ''}`}
                  disabled={!postText.trim()}
                  onClick={handlePublish}
                >
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
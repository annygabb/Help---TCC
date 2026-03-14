import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, MessageSquare, Bell, Search,
  Share2, ThumbsUp, MessageCircle, Image, Video, MapPin
} from 'lucide-react';
import './Feed.css';
import logoImg from '../assets/logo.png';
import nttLogo from '../assets/ntt-logo.jpg';

const Feed = () => {
  const navigate = useNavigate();

  const handleOpenPostModal = () => {
    console.log("Abrindo modal de publicação...");
  };

  return (
    <div className="feed-container">
      <nav className="user-header">
        <div className="header-inner">
          <div className="header-left">
            <img
              src={logoImg}
              alt="Help Logo"
              className="header-logo"
              onClick={() => navigate('/')}
            />
            <div className="search-bar">
              <Search size={18} color="#9ca3af" />
              <input
                type="text"
                id="header-search"
                name="header-search"
                placeholder="Pesquisar..."
              />
            </div>
          </div>

          <div className="header-right-nav">
            <div className="nav-item active"><Home size={22} /><span>Início</span></div>
            <div className="nav-item"><BookOpen size={22} /><span>Cursos</span></div>
            <div className="nav-item"><Briefcase size={22} /><span>Vagas</span></div>
            <div className="nav-item"><MessageSquare size={22} /><span>Mensagens</span></div>
            <div className="nav-item"><Bell size={22} /><span>Notificações</span></div>
          </div>
        </div>
      </nav>

      <main className="feed-content">
        <aside className="left-column">
          <div
            className="profile-card-dark"
            onClick={() => navigate('/configuracao-perfil')}
          >
            <div className="profile-header-info">
              <div className="avatar-preview-small"></div>
              <div className="user-details-text">
                <h3>Anny Gabrielly Go...</h3>
                <p className="bio-text">
                  Cursando Engenharia de Software | Java | HTML | CSS | PostgreSQL | UX/UI | Service Now | Metodologias Ágeis
                </p>
                <div className="location-info">
                  <MapPin size={12} />
                  <span className="location-text">Silvânia, Goiás</span>
                </div>
              </div>
            </div>

            <div className="company-info-row">
              <div className="company-logo-box">
                <img src={nttLogo} alt="NTT DATA" />
              </div>
              <span className="company-name">NTT DATA Europe & Latam</span>
            </div>
          </div>
        </aside>

        <section className="main-column">
          <div className="glass-card create-post-container">
            <div className="post-input-row">
              <div className="avatar-mini"></div>
              <button
                className="post-button-vibrant"
                onClick={handleOpenPostModal}
              >
                Começar publicação
              </button>
            </div>

            <div className="post-actions-row">
              <button className="action-item">
                <Video size={20} />
                <span>Vídeo</span>
              </button>
              <button className="action-item">
                <Image size={20} />
                <span>Foto</span>
              </button>
            </div>
          </div>

          <div className="glass-card post">
            <div className="post-header">
              <div className="avatar-mini"></div>
              <div className="post-info">
                <h4>Help - Plataforma de Carreiras</h4>
                <span>Promovido</span>
              </div>
            </div>
            <div className="post-body">
              <p>Bem-vinda ao seu novo ecossistema profissional! Explore vagas e cursos voltados para Engenharia de Software.</p>
            </div>
            <div className="post-actions">
              <button><ThumbsUp size={18} /> Gostei</button>
              <button><MessageCircle size={18} /> Comentar</button>
              <button><Share2 size={18} /> Compartilhar</button>
            </div>
          </div>
        </section>

        <aside className="right-column">
          <div className="glass-card rec-card">
            <h4>Vagas Recomendadas</h4>
            <div className="rec-item">
              <strong>Desenvolvedor Java</strong>
              <span>Anápolis, GO</span>
            </div>
            <button className="view-all">Ver todas as vagas</button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Feed;
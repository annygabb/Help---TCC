import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, BookOpen, Briefcase, MessageSquare, Bell, Search, Share2, ThumbsUp, MessageCircle } from 'lucide-react';
import './Feed.css';
import logoImg from '../assets/logo.png';

const Feed = () => {
  const navigate = useNavigate();

  return (
    <div className="feed-container">
      {/* HEADER ATUALIZADO */}
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
            <div className="nav-item active">
              <Home size={22} />
              <span>Início</span>
            </div>
            <div className="nav-item">
              <BookOpen size={22} />
              <span>Cursos</span>
            </div>
            <div className="nav-item">
              <Briefcase size={22} />
              <span>Vagas</span>
            </div>
            <div className="nav-item">
              <MessageSquare size={22} />
              <span>Mensagens</span>
            </div>
            <div className="nav-item">
              <Bell size={22} />
              <span>Notificações</span>
            </div>
            {/* ITEM "EU" REMOVIDO DAQUI */}
          </div>

        </div>
      </nav>

      <main className="feed-content">
        <aside className="left-column">
          {/* CARD DE PERFIL TOTALMENTE CLICÁVEL */}
          <div
            className="glass-card profile-card"
            onClick={() => navigate('/configuracao-perfil')}
            style={{ cursor: 'pointer' }}
          >
            <div className="profile-bg"></div>
            <div className="avatar-large"></div>
            <h3>Anny Gabrielly</h3>
            <p>Systems Analyst na NTT DATA</p>
            <div className="profile-stats">
              <div className="stat-row">
                <span>Visualizações do perfil</span>
                <span className="stat-number">42</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="main-column">
          <div className="glass-card create-post">
            <div className="post-input-row">
              <div className="avatar-mini"></div>
              <button className="post-button-mock">Começar publicação...</button>
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
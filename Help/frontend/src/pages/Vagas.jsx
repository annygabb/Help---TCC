import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Briefcase, MessageSquare, Bell, Search, MapPin, DollarSign, Building, Share2 } from 'lucide-react';
import './Vagas.css';
import logoImg from '../assets/logo.png';
import nttLogo from '../assets/ntt-logo.jpg';

const Vagas = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const listaVagas = [
    { id: 1, cargo: "Desenvolvedor Java Pleno", empresa: "NTT DATA", local: "Remoto", salario: "A combinar" },
    { id: 2, cargo: "Analista de Sistemas", empresa: "Tech Solutions", local: "Anápolis, GO", salario: "R$ 6.000,00" }
  ];

  return (
    <div className="feed-container">
      <nav className="user-header">
        <div className="header-inner">
          <div className="header-left">
            <img src={logoImg} alt="Help Logo" className="header-logo" onClick={() => navigate('/feed')} />
            <div className="search-bar">
              <Search size={18} color="#9ca3af" />
              <input type="text" placeholder="Pesquisar vagas..." />
            </div>
          </div>
          <div className="header-right-nav">
            <Link to="/feed" className={`nav-item ${location.pathname === '/feed' ? 'active' : ''}`}><Home size={22} /><span>Início</span></Link>
            <Link to="/cursos" className={`nav-item ${location.pathname === '/cursos' ? 'active' : ''}`}><BookOpen size={22} /><span>Cursos</span></Link>
            <Link to="/vagas" className={`nav-item ${location.pathname === '/vagas' ? 'active' : ''}`}><Briefcase size={22} /><span>Vagas</span></Link>
            <div className="nav-item"><MessageSquare size={22} /><span>Mensagens</span></div>
            <div className="nav-item"><Bell size={22} /><span>Notificações</span></div>
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
                <div className="location-info"><MapPin size={12} /><span className="location-text">Silvânia, Goiás</span></div>
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
            <h2 style={{ fontSize: '18px' }}>Vagas para o seu perfil</h2>
            <p className="bio-text">Com base em suas competências de Engenharia de Software.</p>
          </div>

          {listaVagas.map(vaga => (
            <div className="post" key={vaga.id} style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="company-logo-box" style={{ width: '50px', height: '50px' }}><Building size={24} color="#a755f7"/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ color: 'white', fontSize: '16px', margin: 0 }}>{vaga.cargo}</h4>
                    <Share2 size={14} color="#ffffff" style={{ cursor: 'pointer', opacity: 0.7 }} />
                  </div>
                  <p style={{ color: '#a755f7', fontSize: '14px', fontWeight: '600', margin: '4px 0' }}>{vaga.empresa}</p>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
                    <span className="location-text"><MapPin size={12} /> {vaga.local}</span>
                    <span className="location-text"><DollarSign size={12} /> {vaga.salario}</span>
                  </div>
                </div>
              </div>
              <div className="post-actions" style={{ marginTop: '20px' }}>
                <button style={{ width: '100%' }}>Candidatura Simplificada</button>
              </div>
            </div>
          ))}
        </section>

        <aside className="right-column">
          <div className="rec-card">
            <h4>Dicas de Carreira</h4>
            <p className="bio-text">Como se destacar em processos seletivos de Software.</p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Vagas;
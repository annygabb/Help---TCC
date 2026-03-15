import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, MessageSquare, Bell, Search,
  MapPin, Award, Clock, Star, X, PlayCircle
} from 'lucide-react';
import './Cursos.css';
import logoImg from '../assets/logo.png';
import nttLogo from '../assets/ntt-logo.jpg';

const Cursos = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showMeusCursosModal, setShowMeusCursosModal] = useState(false);
  const [cursoSelecionado, setCursoSelecionado] = useState(null);

  const meusCursosMatriculados = [
    {
      id: 1,
      titulo: "Especialista Spring Boot",
      instrutor: "Help Academy",
      duracao: "40h",
      nivel: "Avançado",
      foto: "https://1000logos.net/wp-content/uploads/2020/09/Java-Logo.png"
    },
    {
      id: 4,
      titulo: "React Hooks & Context API",
      instrutor: "Dev Mastery",
      duracao: "25h",
      nivel: "Intermediário",
      foto: "https://1000logos.net/wp-content/uploads/2020/09/Java-Logo.png"
    }
  ];

  const cursosDisponiveis = [
    {
      id: 2,
      titulo: "Java 2",
      instrutor: "Dev Mastery",
      duracao: "25h",
      nivel: "Intermediário",
      foto: "https://1000logos.net/wp-content/uploads/2020/09/Java-Logo.png"
    }
  ];

  return (
    <div className="feed-container">
      {/* POP-UP: MEUS CURSOS (LISTAGEM GERAL) */}
      {showMeusCursosModal && (
        <div className="modal-overlay" onClick={() => setShowMeusCursosModal(false)}>
          <div className="create-post-modal" onClick={e => e.stopPropagation()} style={{ width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ color: 'white', margin: 0 }}>Meus Cursos em Andamento</h3>
              <button className="close-button" onClick={() => setShowMeusCursosModal(false)}>
                <X size={24} color="white" />
              </button>
            </div>

            <div className="modal-content" style={{ padding: '20px' }}>
              {meusCursosMatriculados.map(curso => (
                <div key={curso.id} className="post" style={{ marginBottom: '15px', padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '20px', position: 'relative' }}>
                    <div className="company-logo-box" style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                      <img src={curso.foto} alt={curso.titulo} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ color: 'white', margin: 0, fontSize: '18px' }}>{curso.titulo}</h3>
                          <p style={{ color: '#9ca3af', fontSize: '13px', margin: '2px 0' }}>{curso.instrutor}</p>
                        </div>
                        <Award size={22} color="#a755f7" />
                      </div>

                      <div style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
                        <span className="location-text"><Star size={14} /> {curso.nivel}</span>
                        <span className="location-text"><Clock size={14} /> {curso.duracao}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="publish-button btn-continuar"
                    style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    onClick={() => navigate(`/aula/${curso.id}`)}
                  >
                    <PlayCircle size={18} />
                    Continuar Assistindo
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETALHES DO CURSO INDIVIDUAL */}
      {cursoSelecionado && (
        <div className="modal-overlay" onClick={() => setCursoSelecionado(null)}>
          <div className="create-post-modal" onClick={e => e.stopPropagation()} style={{ width: '550px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="company-logo-box" style={{ width: '50px', height: '50px' }}>
                  <img src={cursoSelecionado.foto} alt="Logo" />
                </div>
                <div>
                  <h3 style={{ color: 'white', margin: 0 }}>{cursoSelecionado.titulo}</h3>
                  <p className="bio-text" style={{ margin: 0 }}>Detalhes do Treinamento</p>
                </div>
              </div>
              <button className="close-button" onClick={() => setCursoSelecionado(null)}>
                <X size={24} color="white" />
              </button>
            </div>
            <div className="modal-content" style={{ padding: '20px', color: 'white' }}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <span className="location-text"><Star size={16} /> {cursoSelecionado.nivel}</span>
                <span className="location-text"><Clock size={16} /> {cursoSelecionado.duracao}</span>
              </div>
              <div style={{ borderTop: '1px solid #333', paddingTop: '15px' }}>
                <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '5px' }}>Instrutor Responsável:</p>
                <h4 style={{ color: '#a755f7', margin: 0 }}>{cursoSelecionado.instrutor}</h4>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #333', padding: '15px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="publish-button" style={{ width: 'auto' }} onClick={() => setCursoSelecionado(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="user-header">
        <div className="header-inner">
          <div className="header-left">
            <img src={logoImg} alt="Help Logo" className="header-logo" onClick={() => navigate('/feed')} />
            <div className="search-bar">
              <Search size={18} color="#9ca3af" />
              <input type="text" placeholder="Pesquisar cursos..." />
            </div>
          </div>
          <div className="header-right-nav">
            <Link to="/feed" className={`nav-item ${location.pathname === '/feed' ? 'active' : ''}`}><Home size={22} /><span>Início</span></Link>
            <Link to="/cursos" className={`nav-item ${location.pathname === '/cursos' ? 'active' : ''}`}><BookOpen size={22} /><span>Cursos</span></Link>
            <Link to="/vagas" className={`nav-item ${location.pathname === '/vagas' ? 'active' : ''}`}><Briefcase size={22} /><span>Vagas</span></Link>
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
          <div
            className="create-post-container"
            style={{ cursor: 'pointer', transition: '0.2s' }}
            onClick={() => setShowMeusCursosModal(true)}
          >
            <h2 style={{ fontSize: '18px', marginBottom: '10px', color: 'white' }}>Meus Cursos</h2>
            <p className="bio-text">Clique para ver os cursos que você está fazendo.</p>
          </div>

          <h3 style={{ color: 'white', margin: '20px 0 10px 5px', fontSize: '16px' }}>Sugestões para você</h3>
          {cursosDisponiveis.map(curso => (
            <div
              className="post"
              key={curso.id}
              style={{ padding: '20px', cursor: 'pointer', marginBottom: '15px' }}
              onClick={() => setCursoSelecionado(curso)}
            >
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="company-logo-box" style={{ width: '80px', height: '80px' }}>
                  <img src={curso.foto} alt={curso.titulo} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 style={{ color: 'white', fontSize: '16px', margin: 0 }}>{curso.titulo}</h4>
                    <Award size={18} color="#a755f7" />
                  </div>
                  <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0' }}>{curso.instrutor}</p>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                    <span className="location-text"><Star size={12} /> {curso.nivel}</span>
                    <span className="location-text"><Clock size={12} /> {curso.duracao}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <aside className="right-column">
          <div className="rec-card">
            <h4>Destaques da Semana</h4>
            <div className="rec-item">
              <strong style={{ color: '#a755f7' }}>Python para Dados</strong>
              <span>Popular entre Analistas</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Cursos;
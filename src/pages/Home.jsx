import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, User, ArrowRight, BookOpen, Award, Share2, X,
  Code, Database, Brain, MapPin, Briefcase, Star
} from 'lucide-react';

import logoImg from '../assets/logo.png';
import womanImg from '../assets/mulher-escritorio.png';
import conexaoImg from '../assets/conexao.png';
import './Home.css';

const DATA = {
  courses: [
    {
      id: 1,
      title: "Desenvolvedor Front-End",
      icon: <Code size={32} />,
      duration: "90h",
      tags: ["React", "TypeScript", "Tailwind"],
      highlight: true
    },
    {
      id: 2,
      title: "Java Full Stack",
      icon: <Database size={32} />,
      duration: "120h",
      tags: ["Spring Boot", "PostgreSQL", "Docker"],
      highlight: false
    },
    {
      id: 3,
      title: "Análise de Dados e IA",
      icon: <Brain size={32} />,
      duration: "75h",
      tags: ["Python", "Pandas", "TensorFlow"],
      highlight: false
    }
  ],
  pillars: [
    { icon: <BookOpen color="#a855f7" size={32} />, title: "Aprenda", desc: "Habilidades que o mercado procura." },
    { icon: <Award color="#a855f7" size={32} />, title: "Certifique", desc: "Certificados reais e aceitos." },
    { icon: <Share2 color="#a855f7" size={32} />, title: "Conecte", desc: "Match inteligente com vagas." }
  ]
};

function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('show-element');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    const handleHashScroll = () => {
      const currentHash = window.location.hash;
      const targetId = currentHash.includes('/#')
        ? currentHash.split('/#')[1]
        : currentHash.split('#')[1];

      if (targetId && targetId !== '/') {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('hashchange', handleHashScroll);
    setTimeout(handleHashScroll, 100);

    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', handleHashScroll);
    };
  }, []);

  const handleNavigation = (path) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  return (
    <div className="home-wrapper">
      <header className="header-glass">
        <div className="header-content-top">
          <img
            src={logoImg}
            alt="Help Logo"
            className="logo-image"
            style={{ cursor: 'pointer' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />

          <nav className={`nav-central ${isSearchOpen ? 'nav-minimized' : ''}`}>
            <a href="#/#inicio">Início</a>
            <a href="#/#sobre">Sobre Nós</a>
            <a href="#/#curso">Cursos</a>
            <a href="#/#vaga">Vagas</a>
            <a href="#/#avaliacoes">Avaliações</a>
          </nav>

          <div className="header-actions">
            <div className={`search-container ${isSearchOpen ? 'open' : ''}`}>
              {isSearchOpen && (
                <input
                  type="text"
                  placeholder="O que deseja buscar?"
                  className="search-input"
                  autoFocus
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onBlur={() => !searchValue && setIsSearchOpen(false)}
                />
              )}
              <button className="icon-action-btn" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                {isSearchOpen ? <X size={22} /> : <Search size={24} />}
              </button>
            </div>

            <button className="icon-action-btn" onClick={() => handleNavigation('/login')}>
              <User size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="main-container-full">
        <section id="inicio" className="hero-banner">
          <div className="hero-text-side">
            <div className="content-box reveal">
              <h1>Multiplique suas <span>Conexões</span> e escale sua Carreira.</h1>
              <p>O Help é a vitrine definitiva para quem busca desenvolver sua carreira e procura vagas de emprego.</p>
              <div className="hero-btns">
                <button className="btn-primary" onClick={() => handleNavigation('/cadastro')}>
                  Começar agora <ArrowRight size={20} />
                </button>
                <button className="btn-secondary" onClick={() => window.location.hash = "/#vaga"}>
                  Explorar Vagas
                </button>
              </div>
            </div>
          </div>
          <div className="hero-image-side">
            <img src={womanImg} alt="Profissional" className="hero-woman" />
            <div className="side-fade-overlay"></div>
          </div>
        </section>

        <section id="sobre" className="about-section">
          <div className="about-container">
            <div className="about-image-side">
              <img src={conexaoImg} alt="Conexão" className="img-abstract reveal" />
              <div className="side-fade-overlay-left"></div>
            </div>

            <div className="about-text-side">
              <div className="glass-card reveal">
                <span className="badge">Sobre o Help</span>
                <h2>Um ecossistema de <span>aceleração</span> para sua carreira.</h2>
                <div className="about-mission">
                  <p><strong>Missão:</strong> Reduzir a distância entre o estudo e a contratação.</p>
                  <p><strong>Visão:</strong> Ser a vitrine definitiva para talentos.</p>
                </div>
                <div className="pillars-list-vertical">
                  {DATA.pillars.map((pillar, idx) => (
                    <div className="pillar-item" key={idx}>
                      <div className="pillar-icon-box">{pillar.icon}</div>
                      <div className="pillar-info">
                        <h4>{pillar.title}</h4>
                        <p>{pillar.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="curso" className="section-padding">
          <div className="section-header reveal">
            <span className="badge">Cursos</span>
            <h2>Nossas <span>Trilhas</span> e Cursos</h2>
          </div>
          <div className="grid-cards">
            {DATA.courses.map((course) => (
              <div key={course.id} className={`course-card reveal ${course.highlight ? 'highlighted' : ''}`}>
                <div className="course-icon">{course.icon}</div>
                <h3>{course.title}</h3>
                <div className="course-meta">
                  <div className="meta-info">
                    <Award size={16} />
                    <span>Certificado</span>
                  </div>
                  <div className="meta-duration">
                    <span>{course.duration}</span>
                  </div>
                </div>
                <div className="tech-tags">
                  {course.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <button type="button" className="btn-outline">Saiba Mais</button>
              </div>
            ))}
          </div>
        </section>

        <section id="vaga" className="section-padding bg-darker">
          <div className="section-header reveal">
            <span className="badge">Jobs</span>
            <h2>Vagas em <span>Destaque</span></h2>
          </div>
          <div className="grid-cards">
            {[1, 2, 3].map((vaga) => (
              <div className="job-card reveal" key={vaga}>
                <div className="job-header">
                  <span className="job-company">Tech Solutions</span>
                  <span className="match-tag">98% MATCH</span>
                </div>
                <h4>Systems Analyst</h4>
                <div className="job-info">
                  <div className="info-group">
                    <MapPin size={16} />
                    <span>Remoto</span>
                  </div>
                  <div className="info-group">
                    <Briefcase size={16} />
                    <span>Full-time</span>
                  </div>
                </div>
                <div className="salary">R$ 6.500 - R$ 8.000</div>
                <button type="button" className="btn-primary-small">Ver Detalhes</button>
              </div>
            ))}
          </div>
        </section>

        <section id="avaliacoes" className="section-padding">
          <div className="section-header reveal">
            <span className="badge">Avaliações</span>
            <h2>O que dizem nossos <span>Talentos</span></h2>
          </div>
          <div className="grid-cards">
            <div className="review-card reveal">
              <div className="stars-row">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="#a855f7" color="#a855f7" />)}
              </div>
              <p>"O Help mudou minha carreira. Consegui minha primeira vaga como Systems Analyst através das certificações da plataforma!"</p>
              <div className="reviewer">
                <div className="reviewer-avatar"></div>
                <div className="reviewer-text">
                  <strong>Anny Gabrielly</strong>
                  <span>Systems Analyst @ NTT DATA</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;



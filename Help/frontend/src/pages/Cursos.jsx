import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, Search, MapPin,
  Clock, Star, X, CheckCircle, Calendar, Filter, RotateCcw, ChevronRight, TrendingUp, Users, Award, LogOut
} from 'lucide-react';
import './Cursos.css';
import logoImg from '../assets/logo.png';
import nttLogo from '../assets/ntt-logo.jpg';

const getDataCor = (data) => {
  if (!data || data === 'Acesso Ilimitado') return '#34d399';
  return '#f87171';
};

const MatriculaForm = ({ curso, onFinalizar, onFechar }) => {
  const [etapa, setEtapa] = useState(1);
  const [dados, setDados] = useState({
    cidade: '', estado: '', genero: '', experiencia: '',
    momento: '', modelos: []
  });

  const handleCheckbox = (valor) => {
    const novosModelos = dados.modelos.includes(valor)
      ? dados.modelos.filter(m => m !== valor)
      : [...dados.modelos, valor];
    setDados({ ...dados, modelos: novosModelos });
  };

  const podeAvancar = dados.cidade && dados.estado && dados.genero && dados.experiencia;
  const podeFinalizar = dados.momento && dados.modelos.length > 0;

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="create-post-modal" onClick={e => e.stopPropagation()} style={{ width: '500px', padding: '25px' }}>
        <div className="modal-header" style={{ border: 'none', padding: '0 0 20px 0' }}>
          <div>
            <h3 style={{ color: 'white', margin: 0 }}>Finalizar Matrícula</h3>
            <p className="bio-text" style={{ fontSize: '12px' }}>{curso.titulo}</p>
          </div>
          <button className="close-button" onClick={onFechar}><X size={24} color="white" /></button>
        </div>

        <div className="modal-content" style={{ color: '#e5e7eb' }}>
          {etapa === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  placeholder="Cidade"
                  className="filter-select"
                  style={{ flex: 2, backgroundImage: 'none', paddingRight: '15px' }}
                  onChange={e => setDados({...dados, cidade: e.target.value})}
                />
                <input
                  placeholder="UF"
                  maxLength="2"
                  className="filter-select"
                  style={{ flex: 1, backgroundImage: 'none', paddingRight: '15px' }}
                  onChange={e => setDados({...dados, estado: e.target.value})}
                />
              </div>

              <select className="filter-select" onChange={e => setDados({...dados, genero: e.target.value})}>
                <option value="">Gênero</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Não-binário">Não-binário</option>
                <option value="Prefiro não dizer">Prefiro não dizer</option>
              </select>

              <label style={{ fontSize: '13px', color: '#9ca3af' }}>Experiência profissional na área do curso:</label>
              <select className="filter-select" onChange={e => setDados({...dados, experiencia: e.target.value})}>
                <option value="">Selecione...</option>
                <option value="Sem experiência">Sem experiência</option>
                <option value="Menos de 1 ano">Menos de 1 ano</option>
                <option value="1 a 2">1 a 2 anos</option>
                <option value="2 a 3">2 a 3 anos</option>
                <option value="3 a 4">3 a 4 anos</option>
                <option value="4 a 5">4 a 5 anos</option>
                <option value="6 ou mais">6 ou mais anos</option>
              </select>

              <button
                className="publish-button"
                disabled={!podeAvancar}
                style={{ opacity: podeAvancar ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => setEtapa(2)}
              >
                Próximo <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label style={{ fontSize: '14px' }}>Qual o seu momento profissional?</label>
              <select className="filter-select" onChange={e => setDados({...dados, momento: e.target.value})}>
                <option value="">Selecione...</option>
                <option value="apenas estuda">Apenas estuda</option>
                <option value="estuda e trabalha">Estuda e trabalha</option>
                <option value="estuda e trabalha na area">Estuda e trabalha na área</option>
              </select>

              <label style={{ fontSize: '14px' }}>Modelos de trabalho que considera:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '5px' }}>
                {['Híbrido', 'Presencial', 'Home Office'].map(m => (
                  <label key={m} style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      style={{ width: '18px', height: '18px', accentColor: '#a755f7' }}
                      onChange={() => handleCheckbox(m)}
                    /> {m}
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button className="publish-button" style={{ background: '#333' }} onClick={() => setEtapa(1)}>Voltar</button>
                <button
                  className="publish-button"
                  disabled={!podeFinalizar}
                  style={{ opacity: podeFinalizar ? 1 : 0.5 }}
                  onClick={() => onFinalizar(dados)}
                >
                  Finalizar Matrícula
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Cursos = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [showMeusCursosModal, setShowMeusCursosModal] = useState(false);
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [showFormMatricula, setShowFormMatricula] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [filtroNivel, setFiltroNivel] = useState('Todos');
  const [filtroPreco, setFiltroPreco] = useState('Todos');

  useEffect(() => {
    const salva = localStorage.getItem('fotoPerfil');
    if (salva) setFotoPerfil(salva);
  }, []);

  const verificarSessao = () => {
    if (!localStorage.getItem('usuarioLogado')) {
      alert("Sua sessão expirou ou você não está logado.");
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado');
    navigate('/login');
  };

  const handleAbrirDetalhes = (curso) => {
    if (verificarSessao()) {
      setCursoSelecionado(curso);
    }
  };

  const handleAcaoCurso = () => {
    if (!verificarSessao()) return;

    if ((cursoSelecionado.progresso || 0) > 0) {
      navigate(`/aula/${cursoSelecionado.id}`);
    } else {
      setShowFormMatricula(true);
    }
  };

  const limparFiltros = () => {
    setFiltroCategoria('Todos');
    setFiltroNivel('Todos');
    setFiltroPreco('Todos');
  };

  const temFiltroAtivo = filtroCategoria !== 'Todos' || filtroNivel !== 'Todos' || filtroPreco !== 'Todos';

  const meusCursosMatriculados = [
    {
      id: 1,
      titulo: "Especialista Spring Boot",
      instrutor: "Help Academy",
      patrocinio: "NTT DATA",
      duracao: "40h",
      tempoRestante: "12h",
      progresso: 70,
      nivel: "Avançado",
      valor: "Gratuito",
      dataLimite: "15/06/2026",
      bio: "Domine o ecossistema Spring Boot, desde a configuração inicial até a implementação de microserviços seguros e escaláveis para o mercado corporativo.",
      foto: "https://1000logos.net/wp-content/uploads/2020/09/Java-Logo.png",
      modulos: ["Ambiente Java", "Spring Boot Initializer", "REST Controllers", "Entity & Repository", "Spring Security"]
    },
    {
      id: 4,
      titulo: "React Hooks & Context API",
      instrutor: "Dev Mastery",
      patrocinio: "Google Cloud",
      duracao: "25h",
      tempoRestante: "20h",
      progresso: 20,
      nivel: "Intermediário",
      valor: "Pago",
      preco: "R$ 89,90",
      dataLimite: "Acesso Ilimitado",
      bio: "Aprofunde seus conhecimentos em React explorando o gerenciamento de estados complexos e efeitos colaterais com Hooks e Context API.",
      foto: "https://1000logos.net/wp-content/uploads/2020/09/Java-Logo.png",
      modulos: ["Fundamentos de Hooks", "useState e useEffect", "Criação de Custom Hooks", "Consumindo Context API"]
    }
  ];

  const cursosDisponiveis = [
    {
      id: 2,
      titulo: "Java 2",
      instrutor: "Dev Mastery",
      patrocinio: "Oracle",
      duracao: "25h",
      nivel: "Intermediário",
      valor: "Gratuito",
      dataLimite: "30/12/2026",
      bio: "Evolua suas habilidades em Java abordando tópicos avançados de Programação Orientada a Objetos e estruturas de dados eficientes.",
      foto: "https://1000logos.net/wp-content/uploads/2020/09/Java-Logo.png",
      modulos: ["Lógica Avançada", "POO", "Collections Framework"],
      progresso: 0
    }
  ];

  const novosCursosData = [
    {
      id: 5,
      titulo: "Arquitetura Cloud AWS",
      instrutor: "Cloud Expert",
      patrocinio: "Amazon",
      categoria: "Programação",
      duracao: "50h",
      nivel: "Avançado",
      valor: "Pago",
      preco: "R$ 199,90",
      dataLimite: "Acesso Ilimitado",
      bio: "Aprenda a projetar soluções escaláveis e resilientes utilizando os principais serviços da AWS, desde EC2 até arquiteturas Serverless modernas.",
      foto: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
      modulos: ["Introdução AWS", "S3 & EC2", "Serverless"]
    },
    {
      id: 6,
      titulo: "Oratória Moderna",
      instrutor: "Lívia Castro",
      patrocinio: "Help Academy",
      categoria: "Comunicação",
      duracao: "10h",
      nivel: "Iniciante",
      valor: "Gratuito",
      dataLimite: "10/11/2026",
      bio: "Desenvolva uma comunicação assertiva e persuasiva, perdendo o medo de falar em público com técnicas de postura e dicção.",
      foto: "https://cdn-icons-png.flaticon.com/512/2942/2942813.png",
      modulos: ["Postura", "Voz e Dicção", "Persuasão"]
    },
    {
      id: 7,
      titulo: "Primeiros Socorros",
      instrutor: "Dr. Roberto",
      patrocinio: "Hospital Central",
      categoria: "Saúde",
      duracao: "20h",
      nivel: "Intermediário",
      valor: "Gratuito",
      dataLimite: "Acesso Ilimitado",
      bio: "Capacitação essencial para lidar com situações de emergência, aprendendo protocolos vitais de atendimento imediato.",
      foto: "https://cdn-icons-png.flaticon.com/512/2966/2966334.png",
      modulos: ["RCP", "Engasgo", "Traumatismos"]
    }
  ];

  const finalizarMatricula = (dadosColetados) => {
    if (!verificarSessao()) return;
    setShowFormMatricula(false);
    navigate(`/aula/${cursoSelecionado.id}`);
    setCursoSelecionado(null);
  };

  const cursosFiltrados = novosCursosData.filter(curso => {
    const matchCat = filtroCategoria === 'Todos' || curso.categoria === filtroCategoria;
    const matchNiv = filtroNivel === 'Todos' || curso.nivel === filtroNivel;
    const matchPre = filtroPreco === 'Todos' || curso.valor === filtroPreco;
    return matchCat && matchNiv && matchPre;
  });

  return (
    <div className="feed-container">
      {showMeusCursosModal && (
        <div className="modal-overlay" onClick={() => setShowMeusCursosModal(false)}>
           <div className="create-post-modal" onClick={e => e.stopPropagation()} style={{ width: '680px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ color: 'white', margin: 0 }}>Meus Cursos em Andamento</h3>
              <button className="close-button" onClick={() => setShowMeusCursosModal(false)}>
                <X size={24} color="white" />
              </button>
            </div>
            <div className="modal-content" style={{ padding: '20px' }}>
              {meusCursosMatriculados.map(curso => (
                <div key={curso.id} className="post" style={{ marginBottom: '15px', padding: '20px', cursor: 'pointer' }} onClick={() => handleAbrirDetalhes(curso)}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div className="company-logo-box" style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                      <img src={curso.foto} alt={curso.titulo} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <h3 style={{ color: 'white', margin: 0, fontSize: '18px' }}>{curso.titulo}</h3>
                        <span style={{ color: '#a755f7', fontWeight: 'bold' }}>{curso.progresso}%</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                        <Calendar size={14} color={getDataCor(curso.dataLimite)} />
                        <span style={{ fontSize: '13px', color: getDataCor(curso.dataLimite), fontWeight: '600' }}>
                          {curso.dataLimite}
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-fill" style={{ width: `${curso.progresso}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {cursoSelecionado && !showFormMatricula && (
        <div className="modal-overlay" onClick={() => setCursoSelecionado(null)}>
          <div className="create-post-modal" onClick={e => e.stopPropagation()} style={{ width: '550px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="company-logo-box" style={{ width: '50px', height: '50px' }}>
                  <img src={cursoSelecionado.foto} alt="Logo" />
                </div>
                <div>
                  <h3 style={{ color: 'white', margin: 0 }}>{cursoSelecionado.titulo}</h3>
                  <p className="bio-text" style={{ margin: 0 }}>Professor: {cursoSelecionado.instrutor}</p>
                </div>
              </div>
              <button className="close-button" onClick={() => setCursoSelecionado(null)}><X size={24} color="white" /></button>
            </div>
            <div className="modal-content" style={{ padding: '20px', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <div className={`badge-status ${cursoSelecionado.valor === 'Gratuito' ? 'badge-free' : 'badge-paid'}`}>
                  {cursoSelecionado.valor === 'Gratuito' ? 'GRATUITO' : (cursoSelecionado.preco || 'PAGO')}
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <span className="location-text"><Star size={16} /> {cursoSelecionado.nivel}</span>
                  <span className="location-text"><Clock size={16} /> {cursoSelecionado.duracao}</span>
                  <span className="location-text" style={{ color: getDataCor(cursoSelecionado.dataLimite) }}>
                    <Calendar size={16} /> {cursoSelecionado.dataLimite || 'Acesso Ilimitado'}
                  </span>
                </div>
              </div>
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: '#a755f7', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>Sobre o Curso</h4>
                <p className="bio-text" style={{ lineHeight: '1.5', fontSize: '14px' }}>{cursoSelecionado.bio}</p>
              </div>
              <h4 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>Ementa do Treinamento</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                {cursoSelecionado.modulos?.map((modulo, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9ca3af', fontSize: '14px' }}>
                    <CheckCircle size={16} color="#a755f7" /> {modulo}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #333', padding: '15px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="publish-button"
                style={{ width: 'auto' }}
                onClick={handleAcaoCurso}
              >
                {(cursoSelecionado.progresso || 0) > 0 ? 'Continuar Aula' : 'Iniciar Agora'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFormMatricula && (
        <MatriculaForm
          curso={cursoSelecionado}
          onFechar={() => setShowFormMatricula(false)}
          onFinalizar={finalizarMatricula}
        />
      )}

      <nav className="user-header">
        <div className="header-inner">
          <div className="header-left">
            <img
              src={logoImg}
              alt="Help Logo"
              className="header-logo"
              onClick={() => navigate('/feed')}
              style={{ cursor: 'pointer' }}
            />
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
            <div className="nav-item logout-nav" onClick={handleLogout} style={{cursor: 'pointer'}}>
                <LogOut size={22} color="#f87171" />
                <span style={{color: '#f87171'}}>Sair</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="feed-content">
        <aside className="left-column">
          <div className="profile-card-dark" onClick={() => navigate('/configuracao-perfil')} style={{ cursor: 'pointer' }}>
            <div className="profile-header-info">
              <div
                className="avatar-preview-small"
                style={{
                  backgroundImage: fotoPerfil ? `url(${fotoPerfil})` : 'none',
                  backgroundColor: fotoPerfil ? 'transparent' : '#1a1a1a',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2px solid #a755f7'
                }}
              >
                {!fotoPerfil && <Users size={20} color="#333" />}
              </div>
              <div className="user-details-text">
                <h3>Anny Gabrielly</h3>
                <p className="bio-text">Analista de Sistemas | NTT DATA</p>
                <div className="location-info"><MapPin size={12} /><span className="location-text">Anápolis, GO</span></div>
              </div>
            </div>
            <div className="company-info-row">
              <div className="company-logo-box"><img src={nttLogo} alt="NTT DATA" /></div>
              <span className="company-name">NTT DATA</span>
            </div>
          </div>
        </aside>

        <section className="main-column">
          <div className="create-post-container" style={{ cursor: 'pointer' }} onClick={() => { if(verificarSessao()) setShowMeusCursosModal(true); }}>
            <h2 style={{ fontSize: '18px', color: 'white', margin: 0 }}>Meus Cursos</h2>
            <p className="bio-text">Progresso detalhado e prazos das suas matrículas.</p>
          </div>

          <h3 style={{ color: 'white', margin: '20px 0 10px 5px', fontSize: '16px' }}>Sugestões para você</h3>

          {cursosDisponiveis.map(curso => (
            <div className="post" key={curso.id} style={{ padding: '20px', cursor: 'pointer', marginBottom: '15px' }} onClick={() => handleAbrirDetalhes(curso)}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="company-logo-box" style={{ width: '80px', height: '80px' }}><img src={curso.foto} alt={curso.titulo} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ color: 'white', fontSize: '16px', margin: 0 }}>{curso.titulo}</h4>
                    <span className={`badge-status ${curso.valor === 'Gratuito' ? 'badge-free' : 'badge-paid'}`}>
                      {curso.valor === 'Gratuito' ? 'GRATUITO' : (curso.preco || 'PAGO')}
                    </span>
                  </div>
                  <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0' }}>Patrocinado por <strong>{curso.patrocinio}</strong></p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <span className="location-text"><Star size={12} /> {curso.nivel}</span>
                      <span className="location-text"><Clock size={12} /> {curso.duracao}</span>
                    </div>
                    <span className="location-text" style={{ color: getDataCor(curso.dataLimite) }}>
                      <Calendar size={12} /> {curso.dataLimite || 'Acesso Ilimitado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="create-post-container" style={{ marginTop: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showFilters ? '15px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', color: 'white', margin: 0 }}>Novos Cursos</h2>
                {temFiltroAtivo && showFilters && (
                  <button onClick={limparFiltros} className="btn-reset-filters">
                    <RotateCcw size={12} /> Limpar Filtros
                  </button>
                )}
              </div>
              <div style={{ color: '#a755f7', cursor: 'pointer' }} onClick={() => setShowFilters(!showFilters)}>
                <Filter size={20} />
              </div>
            </div>
            {showFilters && (
              <div className="filter-row-animation" style={{ display: 'flex', gap: '10px' }}>
                <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="filter-select">
                  <option value="Todos">Categorias</option>
                  <option value="Programação">Programação</option>
                  <option value="Comunicação">Comunicação</option>
                  <option value="Saúde">Saúde</option>
                </select>
                <select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)} className="filter-select">
                  <option value="Todos">Níveis</option>
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </div>
            )}
          </div>

          <div style={{ marginTop: '15px' }}>
            {cursosFiltrados.map(curso => (
              <div className="post" key={curso.id} style={{ padding: '20px', cursor: 'pointer', marginBottom: '15px' }} onClick={() => handleAbrirDetalhes(curso)}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className="company-logo-box" style={{ width: '70px', height: '70px' }}><img src={curso.foto} alt="" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ color: 'white', margin: 0 }}>{curso.titulo}</h4>
                      <span className={`badge-status ${curso.valor === 'Gratuito' ? 'badge-free' : 'badge-paid'}`}>
                        {curso.valor === 'Gratuito' ? 'GRATUITO' : (curso.preco || 'PAGO')}
                      </span>
                    </div>
                    <p style={{ color: '#9ca3af', fontSize: '13px' }}>{curso.instrutor} • {curso.categoria}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <span className="location-text"><Star size={14} /> {curso.nivel}</span>
                        <span className="location-text"><Clock size={14} /> {curso.duracao}</span>
                      </div>
                      <span className="location-text" style={{ color: getDataCor(curso.dataLimite) }}>
                        <Calendar size={14} /> {curso.dataLimite || 'Acesso Ilimitado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="right-column">
          <div className="profile-card-dark" style={{ border: '1px solid rgba(167, 85, 247, 0.3)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <TrendingUp size={18} color="#a755f7" />
              <h3 style={{ color: 'white', fontSize: '14px', margin: 0, textTransform: 'uppercase' }}>Destaque da Semana</h3>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <div className="company-logo-box" style={{ width: '60px', height: '60px', margin: '0 auto 10px' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" alt="AWS" />
              </div>
              <h4 style={{ color: 'white', fontSize: '15px', margin: '0 0 5px' }}>Arquitetura Cloud AWS</h4>
              <p className="bio-text" style={{ fontSize: '12px' }}>Cloud Expert • Amazon</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '15px', borderTop: '1px solid #333' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={16} color="#9ca3af" />
                  <span style={{ fontSize: '13px', color: '#e5e7eb' }}>Iniciou </span>
                </div>
                <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '13px' }}>85%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={16} color="#9ca3af" />
                  <span style={{ fontSize: '13px', color: '#e5e7eb' }}>Acessou</span>
                </div>
                <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '13px' }}>62%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={16} color="#9ca3af" />
                  <span style={{ fontSize: '13px', color: '#e5e7eb' }}>Finalizou</span>
                </div>
                <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '13px' }}>44%</span>
              </div>
            </div>
            <button
              className="publish-button"
              style={{ marginTop: '20px', padding: '10px', fontSize: '13px', width: '100%' }}
              onClick={() => handleAbrirDetalhes(novosCursosData[0])}
            >
              Ver Detalhes
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Cursos;
import GlobalSearch from '../components/GlobalSearch';
import CompanyMenu from '../components/CompanyMenu';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, Search, MapPin, MessageSquare, Bell, Info, ChevronRight,
  Clock, Star, X, CheckCircle, Filter, TrendingUp, Loader2, BookText, ShieldCheck, Copy
} from 'lucide-react';
import './Cursos.css';
import logoImg from '../assets/logo.png';
import logoImgperfil from '../assets/fotoperfil.png';
import api from '../services/api';
import { mensagemDaApi } from '../utils/validacoes';
import { buildApiUrl } from '../services/apiConfig';
import { obterSessao } from '../services/session';
import useCurrentProfile from './useCurrentProfile';

const DetalhesCursoModal = ({ curso, onFechar, onMatricular }) => {
  if (!curso) return null;
  const isGratuito = curso.valor === 'Gratuito';

  const moduloStyle = {
    display: 'flex', alignItems: 'center', padding: '12px 15px',
    background: 'rgba(255,255,255,0.03)', borderRadius: '0 10px 10px 0',
    borderLeft: '3px solid #6366f1', color: '#d1d5db', fontSize: '13px',
    boxSizing: 'border-box', width: '100%',
  };

  return (
    <div
      className="modal-overlay" onClick={onFechar}
      style={{
        zIndex: 1100, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
        alignItems: 'center', padding: '20px', boxSizing: 'border-box',
      }}
    >
      <div
        className="create-post-modal" onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '620px', maxHeight: '90vh', display: 'flex',
          flexDirection: 'column', background: '#13131a', borderRadius: '22px',
          border: '1px solid #2d2d3a', overflow: 'hidden', boxSizing: 'border-box',
        }}
      >
        <div className="modal-header" style={{ padding: '25px 35px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'white', margin: 0 }}>Detalhes do Treinamento</h3>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={24} color="white" />
          </button>
        </div>

        <div className="modal-content" style={{ padding: '30px 35px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'stretch', boxSizing: 'border-box', width: '100%' }}>
          <div style={{ display: 'flex', gap: '25px', marginBottom: '30px', alignItems: 'center' }}>
            <div className="company-logo-box" style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '12px', background: '#fff', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={curso.foto} alt={curso.titulo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ color: 'white', margin: 0, fontSize: '20px' }}>{curso.titulo}</h2>
              <p style={{ color: '#a755f7', fontWeight: '500', fontSize: '14px', marginTop: '4px' }}>{curso.instrutor}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '10px', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold',
                    background: isGratuito ? 'rgba(52,211,153,0.1)' : 'rgba(250,204,21,0.1)',
                    color: isGratuito ? '#34d399' : '#facc15',
                    border: `1px solid ${isGratuito ? 'rgba(52,211,153,0.2)' : 'rgba(250,204,21,0.2)'}`,
                    display: 'inline-flex', alignItems: 'center',
                  }}>
                    {isGratuito ? 'GRATUITO' : (curso.preco || 'PAGO')}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: curso.isIlimitado ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '14px', lineHeight: 1 }}>●</span>
                    {curso.isIlimitado ? 'ACESSO ILIMITADO' : `EXPIRA EM: ${curso.dataLimite || '31/12'}`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={14} color="#9ca3af" /> {curso.nivel || 'Iniciante'}</span>
                  <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={14} color="#facc15" fill="#facc15" /> 4.9</span>
                  <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {curso.duracao}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ color: 'white', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' }}>
              <Info size={18} color="#a755f7" /> Sobre o treinamento
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              {curso.descricao || 'Este treinamento oferece uma imersão completa nos conceitos práticos e teóricos necessários para sua evolução profissional.'}
            </p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ color: 'white', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' }}>
              <BookText size={18} color="#a755f7" /> Grade Curricular
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(curso.modulos && curso.modulos.length > 0 ? curso.modulos : ['Módulo 1: Introdução e Conceitos Base', 'Módulo 2: Práticas Avançadas', 'Módulo 3: Projeto Final e Certificação']).map((mod, i) => (
                <div key={i} style={moduloStyle}>{mod}</div>
              ))}
            </div>
          </div>

          <button
            className="publish-button"
            style={{ width: '100%', height: '48px', fontSize: '15px', borderRadius: '12px', background: '#a755f7', fontWeight: 'bold' }}
            disabled={!isGratuito}
            onClick={() => onMatricular(curso)}
          >
            {isGratuito ? 'Matricular-se agora' : 'Matrícula em breve'}
          </button>
        </div>
      </div>
    </div>
  );
};

const MatriculaForm = ({ curso, usuarioDados, onFinalizar, onFechar }) => {
  const [etapa, setEtapa] = useState('dados');
  const [codigo, setCodigo] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const solicitarCodigo = async () => {
    setCarregando(true); setErro('');
    try {
      await api.post(`/matriculas/gratuitas/${curso.codigo}/solicitar`);
      setEtapa('codigo');
    } catch (falha) { setErro(mensagemDaApi(falha, 'Não foi possível enviar o código. Tente novamente.')); }
    finally { setCarregando(false); }
  };
  const confirmar = async (evento) => {
    evento.preventDefault(); setCarregando(true); setErro('');
    try {
      await api.post(`/matriculas/gratuitas/${curso.codigo}/confirmar`, { codigo: codigo.trim() });
      onFinalizar(curso);
    } catch (falha) { setErro(mensagemDaApi(falha, 'Não foi possível confirmar a matrícula. Tente novamente.')); }
    finally { setCarregando(false); }
  };
  return <div className="modal-overlay" onClick={onFechar} style={{ zIndex: 1200 }}>
    <div className="create-post-modal" onClick={evento => evento.stopPropagation()} style={{ maxWidth: 560, background: '#13131a', padding: 28 }}>
      <div className="modal-header"><h3>Matricular-se em {curso.titulo}</h3><button type="button" onClick={onFechar} aria-label="Fechar"><X size={22}/></button></div>
      <p style={{ color: '#d1d5db' }}>A confirmação será enviada para <strong>{usuarioDados.email || 'o e-mail da sua conta'}</strong>.</p>
      {erro && <p role="alert" style={{ color: '#fca5a5' }}>{erro}</p>}
      {etapa === 'dados' ? <button className="publish-button" type="button" disabled={carregando} onClick={solicitarCodigo}>{carregando ? 'Enviando...' : 'Enviar código por e-mail'}</button> :
        <form onSubmit={confirmar}>
          <label htmlFor="codigo-matricula" style={{ color: 'white' }}>Código recebido por e-mail</label>
          <input id="codigo-matricula" className="filter-select" inputMode="numeric" autoComplete="one-time-code" maxLength={8} pattern="[0-9]{8}" required value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 8))} />
          <button className="publish-button" type="submit" disabled={carregando}>{carregando ? 'Confirmando...' : 'Confirmar matrícula'}</button>
        </form>}
    </div>
  </div>;
};

const Cursos = () => {//pag principal
  const navigate = useNavigate();
  const { perfil } = useCurrentProfile();
  const ehEmpresa = String(obterSessao()?.conta?.tipoConta || "").toUpperCase() === "EMPRESA";
  const [showMeusCursosModal, setShowMeusCursosModal] = useState(false);
  const [cursoParaDetalhes, setCursoParaDetalhes] = useState(null);
  const [cursoParaMatricula, setCursoParaMatricula] = useState(null);
  const [cursoSelecionadoProgresso, setCursoSelecionadoProgresso] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [filtroNivel, setFiltroNivel] = useState('Todos');
  const [filtroPreco, setFiltroPreco] = useState('Todos');

  const [meusCursosMatriculados, setMeusCursosMatriculados] = useState([]);

  const [novosCursosData] = useState([
    {
      id: 1,
      codigo: 'java-spring-boot',
      titulo: 'Java Spring Boot Profissional',
      instrutor: 'Help Academy',
      categoria: 'Programação',
      nivel: 'Avançado',
      duracao: '40h',
      valor: 'Gratuito',
      isIlimitado: true,
      dataLimite: '31/12',
      foto: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
      descricao: 'Domine o framework Java mais utilizado no mercado. Neste treinamento, você aprenderá desde a configuração do ambiente até o deploy de APIs REST seguras e escaláveis utilizando Spring Boot, JPA e AWS.',
      modulos: ['Setup e Spring Initializr', 'JPA e Hibernate', 'Spring Security', 'Documentação com Swagger', 'Deploy AWS'],
    },
    {
      id: 5,
      titulo: 'Arquitetura Cloud AWS',
      instrutor: 'Amazon',
      categoria: 'Cloud',
      nivel: 'Intermediário',
      duracao: '60h',
      valor: 'Pago',
      preco: 'R$ 199,90',
      isIlimitado: false,
      dataLimite: '31/12',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
      descricao: 'Aprenda a projetar soluções resilientes na nuvem da Amazon. Este curso foca nos principais serviços da AWS como EC2, S3 e Lambda, preparando você para as certificações oficiais.',
      modulos: ['Fundamentos Cloud', 'EC2 e S3', 'Lambda e Serverless', 'VPC e Segurança', 'Monitoramento CloudWatch'],
    },
  ]);

  useEffect(() => {
    if (!obterSessao() || ehEmpresa) return;
    let ativa = true;
    api.get('/matriculas/gratuitas/minhas').then(({ data }) => {
      if (!ativa) return;
      setMeusCursosMatriculados((Array.isArray(data) ? data : []).map(m => {
        const curso = novosCursosData.find(item => item.codigo === m.codigo);
        return curso ? { ...curso, progresso: 0 } : null;
      }).filter(Boolean));
    }).catch(() => { if (ativa) setMeusCursosMatriculados([]); });
    return () => { ativa = false; };
  }, [novosCursosData, ehEmpresa]);

  const cursosFiltrados = novosCursosData.filter(curso => {
    const matchesCategoria = filtroCategoria === 'Todos' || curso.categoria.toLowerCase() === filtroCategoria.toLowerCase();
    const matchesNivel = filtroNivel === 'Todos' || curso.nivel.toLowerCase() === filtroNivel.toLowerCase();
    const matchesPreco = filtroPreco === 'Todos' || (filtroPreco === 'Gratuito' ? curso.valor.toLowerCase() === 'gratuito' : curso.valor.toLowerCase() !== 'gratuito');
    return matchesCategoria && matchesNivel && matchesPreco;
  });

  const temFiltroAtivo = filtroCategoria !== 'Todos' || filtroNivel !== 'Todos' || filtroPreco !== 'Todos';

  const limparFiltros = () => { setFiltroCategoria('Todos'); setFiltroNivel('Todos'); setFiltroPreco('Todos'); };

  const verificarSessao = () => {
    const session = obterSessao();
    if (!session) { navigate('/login'); return false; }
    return true;
  };

  const handleAbrirDetalhes = (curso) => setCursoParaDetalhes(curso);

  const handleFinalizarMatricula = (curso) => {
    const jaMatriculado = meusCursosMatriculados.find(c => c.id === curso.id);
    if (!jaMatriculado) setMeusCursosMatriculados([...meusCursosMatriculados, { ...curso, progresso: 0 }]);
    setCursoParaMatricula(null);
    setCursoParaDetalhes(null);
    setShowMeusCursosModal(true);
  };

  const user = {
    name: perfil.nome || 'Usuário',
    email: obterSessao()?.conta?.email || '',
    photo: perfil.fotoUrl,
    role: perfil.cargo,
    location: perfil.localidade,
    company: perfil.empresaAtual
  };

  return (
    <div className="cursos-page-wrapper">

      <nav className="user-header">
        <div className="header-inner">
          <div className="header-left">
            <img src={logoImg} alt="Help Logo" className="header-logo" onClick={() => navigate('/feed')} />
            <GlobalSearch />
          </div>
          <div className="header-right-nav">
            <CompanyMenu />
            <Link to="/feed" className="nav-item"><Home size={22} /><span>Início</span></Link>
            <Link to="/cursos" className="nav-item active"><BookOpen size={22} /><span>Cursos</span></Link>
            <Link to="/vagas" className="nav-item"><Briefcase size={22} /><span>Vagas</span></Link>
            <Link to="/mensagens" className="nav-item"><MessageSquare size={22} /><span>Mensagens</span></Link>
            <Link to="/notificacoes" className="nav-item"><Bell size={22} /><span>Notificações</span></Link>
             </div>
        </div>
      </nav>

      <main className="feed-content">

        <aside className="left-column">
          <div
            className="profile-card-dark"
            onClick={() => navigate('/configuracao-perfil')}
            style={{ cursor: 'pointer', background: '#121217', borderRadius: '20px', border: '1px solid #333', padding: '20px', transition: 'transform 0.2s ease, border-color 0.2s ease' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#a755f7'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#333'}
          >
            <div className="profile-header-info" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div className="avatar-preview-small" style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
                <div style={{ position: 'absolute', inset: '-3px', borderRadius: '18px', background: 'linear-gradient(45deg, #a755f7, #6366f1)', zIndex: 0 }} />
                <img src={user.photo || logoImgperfil} alt="Perfil" style={{ width: '100%', height: '100%', borderRadius: '15px', objectFit: 'cover', position: 'relative', zIndex: 1, border: '3px solid #121217' }} />
              </div>
              <div className="user-details-text">
                <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '700' }}>{user.name}</h3>
                {user.role && <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0', lineHeight: '1.2' }}>{user.role}</p>}
                {user.location && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} color="#9ca3af" />
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>{user.location}</span>
                </div>}
              </div>
            </div>
            {user.company && <>
              <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '20px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(167,85,247,0.12)' }}>
                  <Briefcase size={20} color="#a755f7" />
                </div>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>{user.company}</span>
              </div>
            </>}
          </div>
        </aside>

        <section className="main-column">

          <div
            className="create-post-container"
            onClick={() => { if (verificarSessao()) setShowMeusCursosModal(true); }}
            style={{ cursor: 'pointer', background: 'linear-gradient(145deg, #13131a, #1a1a24)', border: '1px solid #2d2d3a', transition: 'transform 0.2s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', color: 'white', margin: 0, fontWeight: '700' }}>Meus Cursos</h2>
                <p className="bio-text" style={{ margin: '5px 0 0 0' }}>Gerencie suas matrículas e progresso atual.</p>
              </div>
              <div style={{ background: 'rgba(167,85,247,0.1)', padding: '10px', borderRadius: '12px' }}>
                <BookOpen size={24} color="#a755f7" />
              </div>
            </div>
          </div>

          <h3 style={{ color: 'white', margin: '25px 0 15px 5px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={18} color="#facc15" /> Sugestões para seu perfil
          </h3>

          <div className="post" style={{ padding: '20px', cursor: 'pointer', borderLeft: '4px solid #a755f7', background: '#13131a' }} onClick={() => handleAbrirDetalhes(novosCursosData[0])}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="company-logo-box" style={{ width: '60px', height: '60px', background: '#fff', borderRadius: '12px', padding: '8px' }}>
                <img src={novosCursosData[0].foto} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ color: 'white', margin: 0, fontSize: '16px' }}>{novosCursosData[0].titulo}</h4>
                    <p className="bio-text" style={{ fontSize: '13px', marginTop: '4px' }}>Help Academy • Patrocinado por NTT DATA</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                    <span style={{ color: '#34d399', fontSize: '10px', fontWeight: 'bold', background: 'rgba(52,211,153,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(52,211,153,0.2)' }}>
                      {novosCursosData[0].valor?.toUpperCase() || 'GRATUITO'}
                    </span>
                    <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#34d399', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <div style={{ width: '6px', height: '6px', background: '#34d399', borderRadius: '50%' }} /> ILIMITADO
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span className="location-text" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={13} color="#9ca3af" /> {novosCursosData[0].nivel}</span>
                    <span className="location-text" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={13} fill="#fbbf24" color="#fbbf24" /> 4.9</span>
                    <span className="location-text" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {novosCursosData[0].duracao || '40h'}</span>
                  </div>
                  <button className="publish-button" style={{ padding: '8px 20px', fontSize: '12px', height: 'auto', width: 'auto', borderRadius: '8px' }}>Ver Detalhes</button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="create-post-container"
            style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box', marginTop: '35px', padding: '18px 25px', background: '#13131a', borderRadius: showFilters ? '12px 12px 0 0' : '12px', border: '1px solid #2d2d3a' }}
          >
            <h2 style={{ fontSize: '18px', color: 'white', margin: 0, fontWeight: '700' }}>Explorar Novos Treinamentos</h2>
            <div className="filter-trigger" onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#a755f7', padding: '8px 16px', borderRadius: '8px', background: 'rgba(167,85,247,0.05)', border: '1px solid rgba(167,85,247,0.1)', marginLeft: 'auto' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Filtros</span>
              <Filter size={20} />
            </div>
          </div>

          {showFilters && (
            <div style={{ background: '#0f0f1a', padding: '25px', borderRadius: '0 0 12px 12px', border: '1px solid #2d2d3a', borderTop: 'none', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'inset 0px 4px 20px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                {[
                  { label: 'CATEGORIA', value: filtroCategoria, setter: setFiltroCategoria, options: ['Todos|Todas as categorias', 'Programação|Programação', 'Cloud|Cloud', 'Soft Skills|Soft Skills', 'ServiceNow|ServiceNow'] },
                  { label: 'NÍVEL', value: filtroNivel, setter: setFiltroNivel, options: ['Todos|Todos os níveis', 'Iniciante|Iniciante', 'Intermediário|Intermediário', 'Avançado|Avançado'] },
                  { label: 'PREÇO', value: filtroPreco, setter: setFiltroPreco, options: ['Todos|Todos', 'Gratuito|Gratuito', 'Pago|Pago'] },
                ].map(({ label, value, setter, options }) => (
                  <div key={label} style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ color: '#a755f7', fontSize: '11px', display: 'block', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>{label}</label>
                    <select value={value} onChange={e => setter(e.target.value)} style={{ width: '100%', background: '#161625', color: 'white', border: '1px solid #33334d', padding: '12px', borderRadius: '10px', outline: 'none', cursor: 'pointer' }}>
                      {options.map(o => { const [val, txt] = o.split('|'); return <option key={val} value={val}>{txt}</option>; })}
                    </select>
                  </div>
                ))}
              </div>
              {temFiltroAtivo && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '15px', borderTop: '1px solid #2d2d3a' }}>
                  <button onClick={limparFiltros} style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.4)', padding: '8px 20px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                    onMouseOver={e => e.target.style.background = 'rgba(248,113,113,0.2)'}
                    onMouseOut={e => e.target.style.background = 'rgba(248,113,113,0.1)'}
                  >LIMPAR TODOS OS FILTROS</button>
                </div>
              )}
            </div>
          )}

          {temFiltroAtivo && (
            <h3 style={{ color: 'white', fontSize: '16px', margin: '25px 0 15px 5px', fontWeight: '600' }}>Resultados ({cursosFiltrados.length})</h3>
          )}

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {cursosFiltrados.length > 0 ? cursosFiltrados.map(curso => (
              <div key={curso.id} className="post" style={{ padding: '18px', cursor: 'pointer', border: '1px solid #2d2d3a' }} onClick={() => handleAbrirDetalhes(curso)}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className="company-logo-box" style={{ width: '55px', height: '55px', background: '#fff', borderRadius: '10px', padding: '6px' }}>
                    <img src={curso.foto} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ color: 'white', margin: 0, fontSize: '15px', fontWeight: '600' }}>{curso.titulo}</h4>
                        <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>{curso.instrutor} • {curso.categoria}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px', color: curso.valor === 'Gratuito' ? '#34d399' : '#facc15', background: curso.valor === 'Gratuito' ? 'rgba(52,211,153,0.1)' : 'rgba(250,204,21,0.1)', border: `1px solid ${curso.valor === 'Gratuito' ? 'rgba(52,211,153,0.2)' : 'rgba(250,204,21,0.2)'}` }}>
                          {curso.valor === 'Gratuito' ? 'GRATUITO' : (curso.preco || 'PAGO')}
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: curso.isIlimitado ? '#34d399' : '#f87171' }}>
                          ● {curso.isIlimitado ? 'ILIMITADO' : `LIMITE: ${curso.dataLimite || '31/12'}`}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px', alignItems: 'center' }}>
                      <span className="location-text" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={12} color="#9ca3af" /> {curso.nivel}</span>
                      <span className="location-text" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={12} fill="#fbbf24" color="#fbbf24" /> 4.9</span>
                      <span className="location-text" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {curso.duracao}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '60px 40px', background: '#121217', borderRadius: '20px', border: '1px dashed #333' }}>
                <Search size={40} color="#333" style={{ marginBottom: '15px' }} />
                <p style={{ color: '#9ca3af', margin: 0, fontSize: '15px' }}>Nenhum treinamento encontrado para os filtros selecionados.</p>
                <button onClick={limparFiltros} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#a755f7', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>Ver todos os cursos</button>
              </div>
            )}
          </div>
        </section>

        <aside className="right-column">
          <div className="profile-card-dark" style={{ border: '1px solid rgba(167,85,247,0.3)', padding: '20px', borderRadius: '15px', background: '#13131a', position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <TrendingUp size={18} color="#a755f7" />
              <h3 style={{ color: 'white', fontSize: '12px', margin: 0, fontWeight: '800', letterSpacing: '0.5px' }}>DESTAQUE DA SEMANA</h3>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'white', padding: '12px', borderRadius: '12px', display: 'inline-block', marginBottom: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" alt="AWS" style={{ width: '45px', display: 'block' }} />
              </div>
              <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '4px', fontWeight: '700' }}>Arquitetura Cloud AWS</h4>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '20px' }}>Tendência global em Cloud Computing.</p>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '15px 10px', marginBottom: '20px', border: '1px solid #2d2d3a', display: 'flex', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', color: '#a755f7', fontSize: '14px', fontWeight: 'bold' }}>1.2k</span>
                  <span style={{ color: '#6b7280', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Iniciaram</span>
                </div>
                <div style={{ width: '1px', background: '#2d2d3a', height: '25px', alignSelf: 'center' }} />
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', color: 'white', fontSize: '14px', fontWeight: 'bold' }}>5.8k</span>
                  <span style={{ color: '#6b7280', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Pesquisas</span>
                </div>
                <div style={{ width: '1px', background: '#2d2d3a', height: '25px', alignSelf: 'center' }} />
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>430</span>
                  <span style={{ color: '#6b7280', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Finalizaram</span>
                </div>
              </div>
              <button className="publish-button" style={{ width: '100%', height: '42px', borderRadius: '8px', fontWeight: 'bold' }} onClick={() => handleAbrirDetalhes(novosCursosData[1])}>
                Explorar Agora
              </button>
            </div>
          </div>
        </aside>
      </main>

      {cursoParaDetalhes && !cursoParaMatricula && (
        <DetalhesCursoModal
          curso={{ ...cursoParaDetalhes, descricao: cursoParaDetalhes.descricao || 'Este treinamento oferece uma imersão completa nos fundamentos e práticas avançadas da área.' }}
          onFechar={() => setCursoParaDetalhes(null)}
          onMatricular={c => ehEmpresa ? alert("A matrícula está disponível para contas de candidato.") : setCursoParaMatricula(c)}
        />
      )}

      {cursoParaMatricula && (
        <MatriculaForm
          curso={cursoParaMatricula}
          usuarioDados={user}
          onFechar={() => setCursoParaMatricula(null)}
          onFinalizar={handleFinalizarMatricula}
        />
      )}

      {showMeusCursosModal && (
        <div className="modal-overlay" onClick={() => setShowMeusCursosModal(false)}>
          <div className="create-post-modal" onClick={e => e.stopPropagation()} style={{ width: '680px', background: '#13131a', borderRadius: '20px', overflow: 'hidden', border: '1px solid #2d2d3a' }}>
            <div className="modal-header" style={{ padding: '25px', borderBottom: '1px solid #2d2d3a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOpen size={22} color="#a755f7" />
                <h3 style={{ color: 'white', margin: 0, fontSize: '20px' }}>Meus Cursos</h3>
              </div>
              <button onClick={() => setShowMeusCursosModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                <X size={20} color="white" />
              </button>
            </div>
            <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              {meusCursosMatriculados.length > 0 ? meusCursosMatriculados.map(curso => (
                <div key={curso.id} className="post" style={{ marginBottom: '10px', cursor: 'pointer', border: '1px solid #2d2d3a', background: '#0f0f14' }} onClick={() => setCursoSelecionadoProgresso(curso)}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <img src={curso.foto} alt={curso.titulo} style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fff', padding: '4px', objectFit: 'contain' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <p style={{ color: 'white', margin: 0, fontWeight: '600' }}>{curso.titulo}</p>
                        <span style={{ color: '#a755f7', fontWeight: 'bold', fontSize: '13px' }}>{curso.progresso}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2px 0 6px' }}>
                        <p style={{ color: '#9ca3af', margin: 0, fontSize: '12px' }}>{curso.instrutor}</p>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#34d399', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <div style={{ width: '5px', height: '5px', background: '#34d399', borderRadius: '50%' }} /> ILIMITADO
                        </span>
                      </div>
                      <div style={{ height: '6px', background: '#2d2d3a', borderRadius: '3px' }}>
                        <div style={{ width: `${curso.progresso}%`, background: '#a755f7', height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                    <ChevronRight size={18} color="#666" style={{ marginLeft: '10px' }} />
                  </div>
                </div>
              )) : (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>Você ainda não possui cursos matriculados.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {cursoSelecionadoProgresso && (
        <div className="modal-overlay" onClick={() => setCursoSelecionadoProgresso(null)}>
          <div className="create-post-modal" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '620px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#13131a', borderRadius: '20px', border: '1px solid #333' }}>
            <div className="modal-header" style={{ padding: '20px 30px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '600' }}>Detalhes do Treinamento</h3>
              <button onClick={() => setCursoSelecionadoProgresso(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                <X size={22} color="white" />
              </button>
            </div>
            <div className="modal-content" style={{ padding: '25px 30px 30px', overflowY: 'auto', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '25px', alignItems: 'flex-start',
                              width: '100%', background: 'rgba(167,85,247,0.08)', padding: '16px',
                              borderRadius: '14px', border: '1px solid rgba(167,85,247,0.15)', boxSizing: 'border-box'
                            }}>
                              <div style={{ width: '68px', height: '68px', minWidth: '68px', background: '#fff', borderRadius: '12px', padding: '8px', flexShrink: 0, boxSizing: 'border-box' }}>
                                <img src={cursoSelecionadoProgresso.foto} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h2 style={{ color: 'white', margin: '0 0 3px 0', fontSize: '16px', fontWeight: '700', lineHeight: '1.3', wordBreak: 'break-word' }}>
                                  {cursoSelecionadoProgresso.titulo}
                                </h2>
                                <p style={{ color: '#a755f7', fontSize: '13px', margin: '0 0 10px 0', fontWeight: '500' }}>
                                  {cursoSelecionadoProgresso.instrutor}
                                </p>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                                  <span style={{
                                    color: '#34d399', fontSize: '9px', fontWeight: 'bold',
                                    background: 'rgba(52,211,153,0.1)', padding: '3px 8px',
                                    borderRadius: '5px', border: '1px solid rgba(52,211,153,0.2)',
                                    textTransform: 'uppercase'
                                  }}>
                                    {cursoSelecionadoProgresso.valor || 'Gratuito'}
                                  </span>
                                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#34d399', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <div style={{ width: '5px', height: '5px', background: '#34d399', borderRadius: '50%' }} /> ACESSO ILIMITADO
                                  </span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                  <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Star size={13} color="#9ca3af" /> {cursoSelecionadoProgresso.nivel || 'Avançado'}
                                  </span>
                                  <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Star size={13} fill="#fbbf24" color="#fbbf24" /> 4.9
                                  </span>
                                  <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={13} /> {cursoSelecionadoProgresso.duracao || '40h'}
                                  </span>
                                </div>
                              </div>
                            </div>

              <div style={{ marginBottom: '25px', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: '1px solid #2d2d3a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ color: 'white', margin: 0, fontSize: '14px', fontWeight: '600' }}>Seu Progresso Atual</h4>
                  <span style={{ color: '#a755f7', fontWeight: 'bold', fontSize: '16px' }}>{cursoSelecionadoProgresso.progresso}%</span>
                </div>
                <div style={{ height: '8px', background: '#2d2d3a', borderRadius: '4px' }}>
                  <div style={{ width: `${cursoSelecionadoProgresso.progresso}%`, background: 'linear-gradient(90deg,#7c3aed,#a855f7)', height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: 'white', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Info size={18} color="#a755f7" /> Sobre o treinamento
                </h4>
                <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                  {cursoSelecionadoProgresso.descricao || 'Domine o framework Java mais utilizado no mercado. Neste treinamento, você aprenderá desde a configuração do ambiente até o deploy de APIs REST seguras e escaláveis utilizando Spring Boot, JPA e AWS.'}
                </p>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: 'white', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <BookText size={18} color="#a755f7" /> Grade Curricular
                </h4>
                {(cursoSelecionadoProgresso.modulos || ['Setup e Spring Initializr', 'JPA e Hibernate', 'Spring Security', 'Documentação com Swagger', 'Deploy AWS']).map((modulo, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', background: '#1c1c24', padding: '12px 15px', borderRadius: '0 10px 10px 0', marginBottom: '8px', borderLeft: '3px solid #a755f7', color: '#e5e7eb', fontSize: '13px', boxSizing: 'border-box' }}>
                    {modulo}
                  </div>
                ))}
              </div>

              <button className="publish-button" style={{ marginTop: '10px', width: '100%', height: '48px', fontWeight: 'bold', fontSize: '15px' }}>
                Continuar Aula
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Cursos;

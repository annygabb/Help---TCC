import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, MessageSquare, Bell, Search, MapPin,
  DollarSign, Building, Share2, X, Loader2, Upload, Filter, Mail,
  Trash2, ChevronDown, ChevronUp, Target, FileText,
  Award, CheckCircle, Plus, GraduationCap, Globe
} from 'lucide-react';

import './Vagas.css';
import logoImg from '../assets/logo.png';
import { avatarPadrao } from '../utils/avatar';
import useCurrentProfile from './useCurrentProfile';
import { vagaService } from './VagaServiceEmpresa';

const Vagas = () => {
  const navigate = useNavigate();
  const { perfil } = useCurrentProfile();
  const userProfileImg = perfil?.fotoUrl || avatarPadrao(perfil?.nome);

  const [showFiltros, setShowFiltros] = useState(true);
  const [vagaSelecionada, setVagaSelecionada] = useState(null);
  const [etapaCandidatura, setEtapaCandidatura] = useState('detalhes');
  const [enviandoCandidatura, setEnviandoCandidatura] = useState(false);
  const [mensagemCandidatura, setMensagemCandidatura] = useState('');
  const [erroCandidatura, setErroCandidatura] = useState('');

  const [termoBusca, setTermoBusca] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('');
  const [filtroRegime, setFiltroRegime] = useState('Todos');
  const [filtroModalidade, setFiltroModalidade] = useState('Todas');
  const [regimeMenuOpen, setRegimeMenuOpen] = useState(false);
  const regimeMenuRef = useRef(null);

  const [listaVagas, setListaVagas] = useState([]);

  const confirmarCandidatura = async () => {
    if (!vagaSelecionada || enviandoCandidatura) return;
    setEnviandoCandidatura(true);
    setErroCandidatura('');
    try {
      const { data } = await vagaService.candidatar(vagaSelecionada.id);
      setMensagemCandidatura(data.mensagem || 'Candidatura registrada com sucesso.');
    } catch (erro) {
      const resposta = erro.response?.data;
      setErroCandidatura(resposta?.mensagem || resposta?.message || resposta?.error || 'Não foi possível registrar sua candidatura. Tente novamente.');
    } finally {
      setEnviandoCandidatura(false);
    }
  };

  useEffect(() => {
    vagaService.listarTodas().then(({ data }) => setListaVagas((data || []).filter((vaga) => (vaga.status || 'ativa') === 'ativa').map((vaga) => ({
      ...vaga,
      empresa: vaga.empresaNome || 'Empresa contratante',
      local: vaga.localizacao || 'Brasil',
      modalidade: vaga.modelo || 'Não informado',
      valor: vaga.salario || 'A combinar',
      cursosNec: vaga.skillsExigidas || [],
      cursosDes: [],
      descricaoCompleta: vaga.descricao || 'Consulte os detalhes desta oportunidade.'
    })))).catch((erro) => console.error('Erro ao carregar vagas:', erro));
  }, []);

  const vagasFiltradas = listaVagas.filter(vaga => {
    const matchTexto = vaga.cargo.toLowerCase().includes(termoBusca.toLowerCase()) ||
                       vaga.empresa.toLowerCase().includes(termoBusca.toLowerCase());
    const matchLocal = vaga.local.toLowerCase().includes(filtroLocal.toLowerCase());
    const matchRegime = filtroRegime === 'Todos' || vaga.tipo === filtroRegime;
    const matchModalidade = filtroModalidade === 'Todas' || vaga.modalidade === filtroModalidade;
    return matchTexto && matchLocal && matchRegime && matchModalidade;
  });

  const filtrosAtivos = Boolean(termoBusca || filtroLocal || filtroRegime !== 'Todos' || filtroModalidade !== 'Todas');

  const limparFiltros = () => {
    setTermoBusca('');
    setFiltroLocal('');
    setFiltroRegime('Todos');
    setFiltroModalidade('Todas');
  };

  useEffect(() => {
    const fecharAoClicarFora = (event) => {
      if (!regimeMenuRef.current?.contains(event.target)) setRegimeMenuOpen(false);
    };
    document.addEventListener('mousedown', fecharAoClicarFora);
    return () => document.removeEventListener('mousedown', fecharAoClicarFora);
  }, []);

  const avatarStyle = { width: '100%', height: '100%', borderRadius: '15px', objectFit: 'cover' };

  return (
    <div className="feed-container">
      {vagaSelecionada && (
        <div className="modal-overlay" onClick={() => { setVagaSelecionada(null); setEtapaCandidatura('detalhes'); }} style={{ padding: '20px', boxSizing: 'border-box' }}>
          <div className="create-post-modal" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '850px', background: '#121217', border: '1px solid #333', maxHeight: '90vh', borderRadius: '15px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>

            <div className="modal-header" style={{ borderBottom: '1px solid #333', background: '#1a1a21', padding: '20px', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#a755f7', padding: '6px', borderRadius: '8px' }}><Briefcase size={18} color="white"/></div>
                <h3 style={{ color: 'white', margin: 0 }}>
                  {etapaCandidatura === 'revisao' ? 'Revisar Informações Profissionais' : 'Detalhes da Oportunidade'}
                </h3>
              </div>
              <button className="close-button" onClick={() => { setVagaSelecionada(null); setEtapaCandidatura('detalhes'); }}><X size={24} color="white" /></button>
            </div>

            <div className="modal-content" style={{ padding: '24px', overflowY: 'auto', flex: 1, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
              {etapaCandidatura === 'detalhes' && (
                <div style={{ textAlign: 'left' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                    <div>
                      <h2 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '24px' }}>{vagaSelecionada.cargo}</h2>
                      <p style={{ color: '#a755f7', fontWeight: 'bold', fontSize: '18px', margin: 0 }}>{vagaSelecionada.empresa}</p>
                    </div>
                    <div style={{ background: 'rgba(167, 85, 247, 0.1)', border: '1px solid #a755f7', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' }}>
                      {vagaSelecionada.tipo}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    <span className="location-text" style={{ background: '#121217', padding: '8px 15px', borderRadius: '8px', border: '1px solid #333', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={16} color="#a755f7" /> {vagaSelecionada.local}</span>
                    <span className="location-text" style={{ background: '#121217', padding: '8px 15px', borderRadius: '8px', border: '1px solid #333', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}><Target size={16} color="#a755f7" /> {vagaSelecionada.modalidade}</span>
                    <span className="location-text" style={{ background: '#121217', padding: '8px 15px', borderRadius: '8px', border: '1px solid #333', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}><DollarSign size={16} color="#a755f7" /> {vagaSelecionada.valor}</span>
                  </div>

                  <div style={{ marginBottom: '25px' }}>
                    <h4 style={{ color: 'white', marginBottom: '10px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={18} color="#a755f7" /> Sobre a Vaga
                    </h4>
                    <div style={{ background: '#1e0a3d', padding: '20px', borderRadius: '12px', border: '1px solid rgba(167, 85, 247, 0.3)' }}>
                      <p style={{ color: '#e5e7eb', lineHeight: '1.6', fontSize: '14px', margin: 0 }}>{vagaSelecionada.descricaoCompleta}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div>
                      <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={18} color="#4ade80" /> Cursos Necessários
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {vagaSelecionada.cursosNec.map((curso, idx) => (
                          <span key={idx} style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', color: '#4ade80', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{curso}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={18} color="#facc15" /> Cursos Desejáveis
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {vagaSelecionada.cursosDes.map((curso, idx) => (
                          <span key={idx} style={{ background: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.2)', color: '#facc15', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{curso}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(167, 85, 247, 0.05)', padding: '25px', borderRadius: '12px', border: '1px dashed #a755f7' }}>
                    <p style={{ color: '#d1d5db' }}>Sua candidatura usa os dados profissionais do seu perfil no Help.</p>
                    {erroCandidatura && <p role="alert" style={{ color: '#fca5a5' }}>{erroCandidatura}</p>}
                    {mensagemCandidatura && <p role="status" style={{ color: '#86efac' }}>{mensagemCandidatura}</p>}
                    <button className="publish-button" type="button" disabled={enviandoCandidatura || Boolean(mensagemCandidatura)} onClick={confirmarCandidatura}>
                      {enviandoCandidatura ? 'Enviando...' : 'Candidatar-se'}
                    </button>
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>
      )}

      <nav className="user-header">
        <div className="header-inner">
          <div className="header-left">
            <img src={logoImg} alt="Logo" className="header-logo" onClick={() => navigate('/feed')} />
            <div className="search-bar">
              <Search size={18} color="#9ca3af" />
              <input type="text" placeholder="Buscar no sistema..." />
            </div>
          </div>
          <div className="header-right-nav">
            <Link to="/feed" className="nav-item"><Home size={22} /><span>Início</span></Link>
            <Link to="/cursos" className="nav-item"><BookOpen size={22} /><span>Cursos</span></Link>
            <Link to="/vagas" className="nav-item active"><Briefcase size={22} /><span>Vagas</span></Link>
            <Link to="/mensagens" className="nav-item"><MessageSquare size={22} /><span>Mensagens</span></Link>
            <Link to="/notificacoes" className="nav-item"><Bell size={22} /><span>Notificações</span></Link>
                      </div>
        </div>
      </nav>

      <main className="feed-content">
        <aside className="left-column">
          <div className="profile-card-dark" onClick={() => navigate('/configuracao-perfil')}//perfil config
            style={{
              cursor: 'pointer',
              background: '#121217',
              borderRadius: '20px',
              border: '1px solid #333',
              padding: '20px'
            }}>

            <div className="profile-header-info" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div className="avatar-preview-small" style={{ position: 'relative', width: '70px', height: '70px' }}>
                <div style={{
                  position: 'absolute',
                  inset: '-3px',
                  borderRadius: '18px',
                  background: 'linear-gradient(45deg, #a755f7, #6366f1)',
                  zIndex: 0
                }}></div>
                <img src={perfil.fotoUrl || userProfileImg} alt={`Foto de ${perfil.nome || 'usuário'}`} style={{ ...avatarStyle, position: 'relative', zIndex: 1, border: '3px solid #121217' }} />
              </div>

              <div className="user-details-text">
                <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '700' }}>{perfil.nome || 'Usuário'}</h3>
                {perfil.cargo && <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0' }}>{perfil.cargo}</p>}
                {perfil.localidade && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} color="#9ca3af" />
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>{perfil.localidade}</span>
                </div>}
              </div>
            </div>

            {perfil.empresaAtual && <>
              <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '20px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(167,85,247,0.12)'
                }}>
                  <Briefcase size={20} color="#a755f7" />
                </div>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>{perfil.empresaAtual}</span>
              </div>
            </>}
          </div>
        </aside>

        <section className="main-column">
          <div className="filter-container-dark" style={{//filtro e lista de vagas
            background: 'linear-gradient(135deg, #1e0a3d 0%, #0f051a 100%)',
            borderRadius: '15px', padding: '25px', borderLeft: '5px solid #a755f7', marginBottom: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowFiltros(!showFiltros)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Filter size={22} color="#a755f7" />
                <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '600' }}>Configurar Busca de Vagas</h3>
              </div>
              {showFiltros ? <ChevronUp size={24} color="#a755f7" /> : <ChevronDown size={24} color="#a755f7" />}
            </div>

            {showFiltros && (
              <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '15px' }}>
                   <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Search size={18} color="#9ca3af" />
                      <input
                        placeholder="Cargo ou empresa..."
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                      />
                   </div>
                   <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MapPin size={18} color="#9ca3af" />
                      <input
                        placeholder="Cidade ou Estado..."
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                        value={filtroLocal}
                        onChange={(e) => setFiltroLocal(e.target.value)}
                      />
                   </div>
                </div>

                <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#d8b4fe', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <Briefcase size={16} /> Regime de contratação
                    </span>
                    <div ref={regimeMenuRef} style={{ position: 'relative', minWidth: '210px' }}>
                      <button
                        type="button"
                        className="regime-filter-trigger"
                        onClick={() => setRegimeMenuOpen((aberto) => !aberto)}
                        aria-expanded={regimeMenuOpen}
                        aria-haspopup="listbox"
                        aria-label="Filtrar vagas por regime de contratação"
                        style={{
                          width: '100%', textAlign: 'left', background: 'linear-gradient(135deg, #24103f, #160923)', color: 'white',
                          border: '1px solid #7e22ce', padding: '10px 38px 10px 14px', borderRadius: '9px', outline: 'none', cursor: 'pointer',
                          fontSize: '14px', fontWeight: '600', boxShadow: filtroRegime === 'Todos' ? 'none' : '0 0 0 3px rgba(167, 85, 247, 0.16)'
                        }}
                      >{filtroRegime === 'Todos' ? 'Todos os regimes' : filtroRegime}</button>
                      <ChevronDown size={17} color="#d8b4fe" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'transform 0.2s', rotate: regimeMenuOpen ? '180deg' : '0deg' }} />
                      {regimeMenuOpen && (
                        <div role="listbox" aria-label="Regimes de contratação" style={{ position: 'absolute', top: 'calc(100% + 7px)', width: '100%', zIndex: 20, overflow: 'hidden', borderRadius: '9px', border: '1px solid #7e22ce', background: '#170725', boxShadow: '0 12px 28px rgba(0, 0, 0, 0.42)' }}>
                          {[
                            ['Todos', 'Todos os regimes'],
                            ['CLT', 'CLT'],
                            ['PJ', 'Pessoa Jurídica (PJ)']
                          ].map(([valor, rotulo]) => (
                            <button
                              type="button"
                              className="regime-filter-option"
                              role="option"
                              aria-selected={filtroRegime === valor}
                              key={valor}
                              onClick={() => { setFiltroRegime(valor); setRegimeMenuOpen(false); }}
                              style={{ width: '100%', border: 0, borderBottom: '1px solid rgba(216, 180, 254, 0.12)', padding: '11px 14px', textAlign: 'left', cursor: 'pointer', color: filtroRegime === valor ? '#fff' : '#d8b4fe', background: filtroRegime === valor ? '#7e22ce' : 'transparent', fontSize: '14px', fontWeight: filtroRegime === valor ? '700' : '500' }}
                            >{rotulo}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#9ca3af', fontSize: '14px' }}>Modalidade:</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['Todas', 'Presencial', 'Remoto', 'Híbrido'].map(mod => (
                        <button
                          key={mod}
                          onClick={() => setFiltroModalidade(mod)}
                          style={{
                            padding: '6px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', transition: '0.3s',
                            background: filtroModalidade === mod ? '#a755f7' : 'transparent',
                            color: filtroModalidade === mod ? 'white' : '#9ca3af',
                            border: `1px solid ${filtroModalidade === mod ? '#a755f7' : '#333'}`
                          }}
                        >
                          {mod}
                        </button>
                      ))}
                    </div>
                  </div>
                  {filtrosAtivos && (
                    <button
                      type="button"
                      onClick={limparFiltros}
                      style={{ alignSelf: 'flex-start', background: 'transparent', color: '#c084fc', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                    >Limpar filtros</button>
                  )}
                </div>
              </div>
            )}
          </div>

          <h2 style={{ fontSize: '18px', color: 'white', marginBottom: '20px' }}>Vagas Sugeridas ({vagasFiltradas.length})</h2>

          {vagasFiltradas.map(vaga => (
            <div className="post" key={vaga.id} onClick={() => { setMensagemCandidatura(''); setErroCandidatura(''); setVagaSelecionada(vaga); }} style={{ cursor: 'pointer', marginBottom: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ background: '#1a1a21', border: '1px solid #333', width: '60px', height: '60px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={30} color="#a755f7"/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ color: 'white', margin: 0, fontSize: '18px' }}>{vaga.cargo}</h4>
                      <p style={{ color: '#a755f7', fontWeight: '600', margin: '4px 0' }}>{vaga.empresa}</p>
                      <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                        <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14}/> {vaga.local}</span>
                        <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Globe size={14}/> {vaga.modalidade}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Vagas;

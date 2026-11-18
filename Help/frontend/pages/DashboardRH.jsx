import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users, Briefcase, Plus, TrendingUp, Search,
    FileText, CheckCircle, MoreVertical, X,
    Edit3, Ban, Home, MessageSquare, Bell, Camera, Save, LogOut
} from 'lucide-react';
import { vagaService } from '../pages/VagaServiceEmpresa';
import logoImg from '../assets/logo.png';
import './DashboardRH.css';
import Talentos from './Talentos';
import VagasRH from './VagasRH';
import { calcularMatchIA } from './matchIA';
import api from '../services/api';
import GlobalSearch from '../components/GlobalSearch';
import { encerrarSessao } from '../services/session';
import { salarioInicial } from '../utils/salario';

const normalizarVagaApi = (vaga) => ({
    ...vaga,
    data: vaga.data || (vaga.dataPublicacao ? new Date(`${vaga.dataPublicacao}T12:00:00`).toLocaleDateString('pt-BR') : 'Hoje'),
    inscritos: vaga.inscritos || vaga.inscritosIds || [],
    skillsExigidas: vaga.skillsExigidas || [],
    status: vaga.status || 'ativa'
});

const DashboardRH = () => {
    const navigate = useNavigate();
    const [busca, setBusca] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [menuAberto, setMenuAberto] = useState(null);
    const [vagaSelecionada, setVagaSelecionada] = useState(null);
    const [statusCandidatos, setStatusCandidatos] = useState({});
    const [itensVisiveis, setItensVisiveis] = useState(3);
    const [pesoSkills, setPesoSkills] = useState(50);
    const [pesoExp, setPesoExp] = useState(50);
    const [abaAtiva, setAbaAtiva] = useState('painel');
    const [vagaParaEditar, setVagaParaEditar] = useState(null);
    const fotoEmpresaRef = useRef(null);
    const [empresa, setEmpresa] = useState({ razaoSocial: '', fotoUrl: null });
    const [relatorioAberto, setRelatorioAberto] = useState(false);

    useEffect(() => {
        api.get('/empresas/me').then(({ data }) => setEmpresa(data)).catch((error) => {
            console.error('Erro ao carregar empresa:', error);
        });
        vagaService.listarMinhas().then(({ data }) => setVagas(data.map(normalizarVagaApi)))
            .catch((error) => console.error('Erro ao carregar vagas:', error));
        api.get('/api/vagas/talentos').then(({ data }) => setTalentos((Array.isArray(data) ? data : []).map(t => ({ ...t, experiencia: 0, certificacoes: [] }))))
            .catch(() => setTalentos([]));
    }, []);

    const alterarFotoEmpresa = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/') || file.size > 4 * 1024 * 1024) {
            alert('Escolha uma imagem de até 4 MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setEmpresa((anterior) => ({ ...anterior, fotoUrl: reader.result }));
        reader.readAsDataURL(file);
    };

    const salvarPerfilEmpresa = async () => {
        try {
            const { data } = await api.put('/empresas/me', {
                corporateName: empresa.razaoSocial,
                fotoUrl: empresa.fotoUrl
            });
            setEmpresa(data);
            try {
                const { fotoPerfil: _fotoAntiga, ...sessao } = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
                localStorage.setItem('usuarioLogado', JSON.stringify({
                    ...sessao, nome: data.razaoSocial,
                    ...(data.fotoUrl?.length <= 60000 ? { fotoPerfil: data.fotoUrl } : {})
                }));
            } catch { console.warn('Perfil salvo, mas os dados locais não puderam ser atualizados.'); }
            alert('Perfil da empresa atualizado.');
        } catch (error) {
            const dados = error.response?.data;
            alert(dados?.mensagem || dados?.error || 'Não foi possível atualizar a empresa.');
        }
    };

    const [novaVaga, setNovaVaga] = useState({
        cargo: '',
        skills: '',
        experienciaMinima: '',
        tipoExperiencia: 'anos',
        modelo: 'Remoto',
        tipo: 'CLT',
        senioridade: 'Pleno',
        localizacao: 'Brasil',
        salario: '',
        prioridade: 'media',
        descricao: ''
    });

    const resetNovaVaga = () => {
        setNovaVaga({
            cargo: '',
            skills: '',
            experienciaMinima: '',
            tipoExperiencia: 'anos',
            modelo: 'Remoto',
            tipo: 'CLT',
            senioridade: 'Pleno',
            localizacao: 'Brasil',
            salario: '',
            prioridade: 'media',
            descricao: ''
        });
    };

    const [talentos, setTalentos] = useState([]);

    const [vagas, setVagas] = useState([]);

    const adicionarVaga = async () => {
        if (!novaVaga.cargo.trim()) return;
        const payload = {
            cargo: novaVaga.cargo.trim(),
            skillsExigidas: novaVaga.skills.split(',').map(s => s.trim()).filter(Boolean),
            experienciaMinima: novaVaga.tipoExperiencia === 'nenhuma' ? 0 : Number(novaVaga.experienciaMinima) || 0,
            salarioBase: salarioInicial(novaVaga.salario),
            tipoExperiencia: novaVaga.tipoExperiencia,
            modelo: novaVaga.modelo,
            tipo: novaVaga.tipo,
            status: "ativa",
            senioridade: novaVaga.senioridade,
            localizacao: novaVaga.localizacao || "Brasil",
            salario: novaVaga.salario || "A combinar",
            prioridade: novaVaga.prioridade,
            descricao: novaVaga.descricao || "Descrição da vaga ainda não cadastrada."
        };
        try {
            const { data } = await vagaService.criar(payload);
            setVagas(prev => [normalizarVagaApi(data), ...prev]);
            resetNovaVaga();
            setShowModal(false);
        } catch (error) {
            alert(error.response?.data?.message || error.response?.data?.error || 'Não foi possível salvar a vaga.');
        }
    };

    const calcularMatch = (talento, vaga) => {
        return calcularMatchIA(talento, vaga, { pesoSkills, pesoExp }).score;
    };

    const analisarMatchIA = (talento, vaga) => {
        return calcularMatchIA(talento, vaga, { pesoSkills, pesoExp });
    };

    const encerrarVaga = async (id) => {
        if (window.confirm("Deseja realmente encerrar esta vaga?")) {
            try { await atualizarVagaPersistida(id, { status: 'encerrada' }); setMenuAberto(null); }
            catch { alert('Não foi possível encerrar a vaga.'); }
        }
    };

    const excluirVaga = async (id) => {
        if (window.confirm("Deseja realmente excluir esta vaga?")) {
            try {
                await vagaService.deletar(id);
                setVagas(vagas.filter(vaga => vaga.id !== id));
                setMenuAberto(null);
                return true;
            } catch { alert('Não foi possível excluir a vaga.'); return false; }
        }
        return false;
    };

    const atualizarVagaPersistida = async (id, dados) => {
        const atual = vagas.find((vaga) => vaga.id === id);
        const payload = { ...atual, ...dados, inscritos: undefined, inscritosIds: undefined, data: undefined };
        if (Object.hasOwn(dados, 'salario')) payload.salarioBase = salarioInicial(dados.salario);
        const { data } = await vagaService.atualizar(id, payload);
        const normalizada = normalizarVagaApi(data);
        setVagas((anteriores) => anteriores.map((vaga) => vaga.id === id ? normalizada : vaga));
        return normalizada;
    };

    const reabrirVaga = async (id) => {
        try { await atualizarVagaPersistida(id, { status: 'ativa' }); setMenuAberto(null); }
        catch { alert('Não foi possível reabrir a vaga.'); }
    };

    const talentosFiltrados = talentos.filter(t => {
        const termoBusca = busca.toLowerCase();
        const nome = t?.nome?.toLowerCase() || "";
        const formacao = t?.formacao?.toLowerCase() || "";
        const skillsString = Array.isArray(t?.skills) ? t.skills.join(' ').toLowerCase() : "";
        return nome.includes(termoBusca) || formacao.includes(termoBusca) || skillsString.includes(termoBusca);
    });

    const alterarStatusCandidato = (vagaId, candidatoId, novoStatus) => {
        setStatusCandidatos(prev => ({
            ...prev,
            [`${vagaId}-${candidatoId}`]: novoStatus
        }));
    };

    const carregarMaisItens = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 5) {
            setItensVisiveis(prev => prev + 3);
        }
    };

    const expBtnStyle = (tipo) => ({
        flex: 1,
        padding: '10px',
        borderRadius: '8px',
        border: novaVaga.tipoExperiencia === tipo ? '2px solid #a755f7' : '1px solid #3f3f46',
        background: novaVaga.tipoExperiencia === tipo ? 'rgba(167, 85, 247, 0.1)' : 'transparent',
        color: novaVaga.tipoExperiencia === tipo ? '#c084fc' : '#a1a1aa',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        transition: 'all 0.2s'
    });

    return (
        <div className="feed-container">
            <nav className="user-header">
                <div className="header-inner">
                    <div className="header-left">
                        <img src={logoImg} alt="Help Logo" className="header-logo" />
                        <GlobalSearch />
                    </div>
                    <div className="header-right-nav">
                        <Link to="/feed" className="nav-item"><Home size={22} /><span>Feed</span></Link>
                        <Link to="/mensagens" className="nav-item"><MessageSquare size={22} /><span>Mensagens</span></Link>
                        <Link to="/notificacoes" className="nav-item"><Bell size={22} /><span>Notificações</span></Link>
                        <div className={`nav-item ${abaAtiva === 'painel' ? 'active' : ''}`} onClick={() => setAbaAtiva('painel')}>
                            <TrendingUp size={22} /><span>Painel</span>
                        </div>
                        <div className={`nav-item ${abaAtiva === 'vagas' ? 'active' : ''}`} onClick={() => setAbaAtiva('vagas')}>
                            <Briefcase size={22} /><span>Vagas</span>
                        </div>
                        <div className={`nav-item ${abaAtiva === 'talentos' ? 'active' : ''}`} onClick={() => setAbaAtiva('talentos')}>
                            <Users size={22} /><span>Talentos</span>
                        </div>
                        <div className="nav-item" onClick={() => { encerrarSessao(); navigate('/login-empresa'); }}>
                            <LogOut size={22} /><span>Sair</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="feed-content rh-layout">
                {abaAtiva === 'painel' && (
                    <>
                        <aside className="left-column">
                            <div className="profile-card-dark">
                                <div className="empresa-profile-editor">
                                    <button type="button" className="empresa-avatar-button" onClick={() => fotoEmpresaRef.current?.click()} title="Alterar foto da empresa">
                                        {empresa.fotoUrl ? <img src={empresa.fotoUrl} alt="Foto da empresa" /> : <Camera size={24} />}
                                    </button>
                                    <input ref={fotoEmpresaRef} type="file" accept="image/*" hidden onChange={alterarFotoEmpresa} />
                                    <input value={empresa.razaoSocial || ''} onChange={(e) => setEmpresa({ ...empresa, razaoSocial: e.target.value })} aria-label="Nome público da empresa" />
                                    <button type="button" className="empresa-save-button" onClick={salvarPerfilEmpresa}><Save size={16} /> Salvar</button>
                                </div>
                                <h4 className="section-title" style={{ marginBottom: '15px', fontSize: '14px', color: '#a755f7' }}>
                                    Resumo Semanal
                                </h4>
                                <div className="rh-stat-item">
                                    <span>Vagas Ativas</span>
                                    <span className="text-purple">
                                        {vagas.filter(v => v.status === 'ativa').length}
                                    </span>
                                </div>
                                <div className="rh-stat-item">
                                    <span>Candidaturas recebidas</span>
                                    <span className="text-purple">{vagas.reduce((total, vaga) => total + (vaga.inscritos?.length || 0), 0)}</span>
                                </div>
                            </div>
                        </aside>

                        <section className="main-column">
                            <div className="create-post-container">
                                <div className="post-input-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Suas Vagas Ativas</h3>
                                    <button className="btn-primary-rh" onClick={() => setShowModal(true)}>
                                        <Plus size={18} /> Publicar Nova Vaga
                                    </button>
                                </div>
                            </div>

                            {vagas
                                .filter(vaga => vaga.status === 'ativa')
                                .map((vaga) => (
                                    <div className="post rh-vaga-card" key={vaga.id} style={{ overflow: 'hidden' }}>
                                        <div className="rh-vaga-content">
                                            <div className="vaga-info">
                                                <h4>{vaga.cargo}</h4>
                                                <p>Publicada em {vaga.data} • <strong>{vaga.inscritos.length} Candidatos</strong></p>
                                            </div>
                                            <div className="vaga-status-wrapper">
                                                <span className="vaga-status active">Ativa</span>
                                            </div>
                                        </div>

                                        <div className="post-actions rh-actions">
                                            <button
                                                className="action-btn"
                                                onClick={() => setVagaSelecionada(vagaSelecionada === vaga.id ? null : vaga.id)}
                                                style={{ color: vagaSelecionada === vaga.id ? '#a755f7' : '' }}
                                            >
                                                <FileText size={18} />
                                                {vagaSelecionada === vaga.id ? 'Ocultar Candidatos' : 'Ver Candidatos'}
                                            </button>
                                            <button className="action-btn" onClick={() => encerrarVaga(vaga.id)}>
                                                <CheckCircle size={18} /> Encerrar
                                            </button>
                                            <div className="more-options-container">
                                                <button className="btn-icon-more-clean" onClick={() => setMenuAberto(menuAberto === vaga.id ? null : vaga.id)}>
                                                    <MoreVertical size={20} />
                                                </button>
                                                {menuAberto === vaga.id && (
                                                    <>
                                                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }} onClick={() => setMenuAberto(null)} />
                                                        <div className="dropdown-menu" style={{ zIndex: 10 }}>
                                                            <div
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    setVagaParaEditar(vaga);
                                                                    setMenuAberto(null);
                                                                    setAbaAtiva('vagas');
                                                                }}
                                                            ><Edit3 size={14} /> Editar</div>
                                                            <div className="dropdown-divider"></div>
                                                            <div className="dropdown-item delete" onClick={() => excluirVaga(vaga.id)}><Ban size={14} /> Excluir</div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {vagaSelecionada === vaga.id && (
                                            <div className="candidates-list" style={{ padding: '20px' }}>
                                                {talentos.filter(t => vaga.inscritos.includes(t.id)).map(candidato => (
                                                    <div className="candidate-item" key={candidato.id}>
                                                        <strong>{candidato.nome}</strong>
                                                        <p>{candidato.cargo || candidato.formacao || 'Perfil profissional'}</p>
                                                        <button type="button" onClick={() => navigate(`/perfil/USUARIO/${candidato.id}`)}>Ver perfil</button>
                                                    </div>
                                                ))}
                                                {vaga.inscritos.length === 0 && <p>Nenhum candidato inscrito para esta vaga ainda.</p>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </section>

                        <aside className="right-column">
                            <div className="rec-card">
                                <h4 style={{ marginBottom: '15px', fontSize: '16px' }}>Talentos Sugeridos</h4>
                                {talentosFiltrados.map(talento => (
                                    <div className="talent-item" key={talento.id} style={{ marginBottom: '15px' }}>
                                        <div className="avatar-mini-rh"></div>
                                        <div className="talent-info">
                                            <strong style={{ display: 'block', fontSize: '14px' }}>{talento.nome}</strong>
                                            <span style={{ fontSize: '11px', color: '#a755f7', display: 'block', marginBottom: '4px' }}>{talento.formacao}</span>
                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                {talento.skills?.slice(0, 3).map((skill, index) => (
                                                    <span key={index} style={{ fontSize: '9px', background: 'rgba(167, 85, 247, 0.1)', color: '#a755f7', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(167, 85, 247, 0.2)' }}>{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </aside>
                    </>
                )}

                {abaAtiva === 'vagas' && (
                    <VagasRH
                        vagas={vagas}
                        setVagas={setVagas}
                        talentos={talentos}
                        busca={busca}
                        setShowModal={setShowModal}
                        calcularMatch={calcularMatch}
                        analisarMatchIA={analisarMatchIA}
                        setAbaAtiva={setAbaAtiva}
                        setVagaSelecionada={setVagaSelecionada}
                        vagaParaEditar={vagaParaEditar}
                        onVagaEdicaoAberta={() => setVagaParaEditar(null)}
                        onAtualizarVaga={atualizarVagaPersistida}
                        onExcluirVaga={excluirVaga}
                    />
                )}

                {abaAtiva === 'talentos' && (
                    <Talentos talentosFiltrados={talentosFiltrados} />
                )}
            </main>

            {relatorioAberto && (
                <div className="modal-overlay" onClick={() => setRelatorioAberto(false)}>
                    <div className="create-post-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
                        <div className="modal-header">
                            <h3>Relatório semanal</h3>
                            <button type="button" onClick={() => setRelatorioAberto(false)}><X size={22} /></button>
                        </div>
                        <div className="modal-content" style={{ padding: '24px' }}>
                            <p><strong>Empresa:</strong> {empresa.razaoSocial || 'Empresa'}</p>
                            <p><strong>Vagas ativas:</strong> {vagas.filter((vaga) => vaga.status === 'ativa').length}</p>
                            <p><strong>Total de candidatos:</strong> {vagas.reduce((total, vaga) => total + (vaga.inscritos?.length || 0), 0)}</p>
                            <p><strong>Aprovados:</strong> {Object.values(statusCandidatos).filter((status) => status === 'aprovado').length}</p>
                            <p><strong>Vagas encerradas:</strong> {vagas.filter((vaga) => vaga.status === 'encerrada').length}</p>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="vaga-modal">
                        <div className="vaga-modal-header">
                            <h3>Publicar Nova Vaga</h3>
                            <button onClick={() => { setShowModal(false); resetNovaVaga(); }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="vaga-edit-grid">
                            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>Nome do Cargo</label>
                                <input
                                    value={novaVaga.cargo}
                                    onChange={e => setNovaVaga({ ...novaVaga, cargo: e.target.value })}
                                    placeholder="Ex: Desenvolvedor Backend"
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>Skills exigidas</label>
                                <input
                                    value={novaVaga.skills}
                                    onChange={e => setNovaVaga({ ...novaVaga, skills: e.target.value })}
                                    placeholder="Ex: React, Node.js, TypeScript"
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>Experiência mínima</label>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {['anos', 'meses', 'nenhuma'].map((tipo) => (
                                        <button
                                            key={tipo}
                                            type="button"
                                            onClick={() => setNovaVaga({ ...novaVaga, tipoExperiencia: tipo })}
                                            style={expBtnStyle(tipo)}
                                        >
                                            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {novaVaga.tipoExperiencia !== 'nenhuma' ? (
                                    <input
                                        type="number"
                                        min="1"
                                        value={novaVaga.experienciaMinima}
                                        onChange={e => setNovaVaga({ ...novaVaga, experienciaMinima: e.target.value })}
                                        placeholder={`Quantidade de ${novaVaga.tipoExperiencia}`}
                                    />
                                ) : (
                                    <div style={{ padding: '12px', background: '#1c1917', borderRadius: '8px', border: '1px solid #292524', color: '#78716c', fontSize: '14px' }}>
                                        Sem exigência de experiência
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>Senioridade</label>
                                <select value={novaVaga.senioridade} onChange={e => setNovaVaga({ ...novaVaga, senioridade: e.target.value })}>
                                    <option>Júnior</option>
                                    <option>Pleno</option>
                                    <option>Sênior</option>
                                    <option>Especialista</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>Localização</label>
                                <input
                                    value={novaVaga.localizacao}
                                    onChange={e => setNovaVaga({ ...novaVaga, localizacao: e.target.value })}
                                    placeholder="Ex: São Paulo, SP"
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>Faixa salarial</label>
                                <input
                                    value={novaVaga.salario}
                                    onChange={e => setNovaVaga({ ...novaVaga, salario: e.target.value })}
                                    placeholder="Ex: R$ 6.000 - R$ 8.000"
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>Modelo de trabalho</label>
                                <select value={novaVaga.modelo} onChange={e => setNovaVaga({ ...novaVaga, modelo: e.target.value })}>
                                    <option>Remoto</option>
                                    <option>Híbrido</option>
                                    <option>Presencial</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>Tipo de contratação</label>
                                <select value={novaVaga.tipo} onChange={e => setNovaVaga({ ...novaVaga, tipo: e.target.value })}>
                                    <option>CLT</option>
                                    <option>PJ</option>
                                    <option>Estágio</option>
                                    <option>Freelancer</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>Prioridade</label>
                                <select value={novaVaga.prioridade} onChange={e => setNovaVaga({ ...novaVaga, prioridade: e.target.value })}>
                                    <option value="baixa">Baixa</option>
                                    <option value="media">Média</option>
                                    <option value="alta">Alta</option>
                                </select>
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>Descrição</label>
                                <textarea
                                    value={novaVaga.descricao}
                                    onChange={e => setNovaVaga({ ...novaVaga, descricao: e.target.value })}
                                    placeholder="Descreva responsabilidades, requisitos e diferenciais da vaga."
                                    rows={4}
                                />
                            </div>
                        </div>

                        <button className="modal-save-btn" onClick={adicionarVaga}>
                            Confirmar Publicação
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardRH;

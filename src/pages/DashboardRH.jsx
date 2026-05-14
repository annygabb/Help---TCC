import React, { useState, useEffect } from 'react';
import {
    Users, Briefcase, Plus, TrendingUp, Search,
    FileText, CheckCircle, MoreVertical, X,
    Edit3, Share2, Ban
} from 'lucide-react';
import { vagaService } from '../services/VagaServiceEmpresa';
import logoImg from '../assets/logo.png';
import './DashboardRH.css';
import Talentos from './Talentos';

const DashboardRH = () => {
    const [busca, setBusca] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [novaVagaCargo, setNovaVagaCargo] = useState('');
    const [menuAberto, setMenuAberto] = useState(null);
    const [vagaSelecionada, setVagaSelecionada] = useState(null);
    const [statusCandidatos, setStatusCandidatos] = useState({});
    const [itensVisiveis, setItensVisiveis] = useState(3);
    const [pesoSkills, setPesoSkills] = useState(50);
    const [pesoExp, setPesoExp] = useState(50);
    const [abaAtiva, setAbaAtiva] = useState('painel');

    const [vagas, setVagas] = useState([]);

    useEffect(() => {
        carregarVagas();
    }, []);

    const carregarVagas = async () => {
        try {
            const response = await vagaService.listarTodas();
            setVagas(response.data);
        } catch (error) {
            console.error("Erro ao carregar vagas do banco:", error);
        }
    };

    const [talentos] = useState([
        {
            id: 1, nome: "Lucas Silva",
            skills: ["React", "Node.js", "TypeScript", "AWS"],
            experiencia: 5,
            formacao: "Bacharel em Engenharia de Software",
            certificacoes: ["AWS Certified Solutions Architect"]
        },
        {
            id: 2, nome: "Ana Costa",
            skills: ["Figma", "UI/UX", "Adobe XD"],
            experiencia: 3,
            formacao: "Design de Produto",
            certificacoes: ["Google UX Design Professional"]
        },
        {
            id: 3, nome: "Bruno Melo",
            skills: ["Python", "Django", "PostgreSQL", "Docker"],
            experiencia: 4,
            formacao: "Ciência da Computação",
            certificacoes: []
        },
        {
            id: 4, nome: "Carla Souza",
            skills: ["React", "JavaScript", "Tailwind"],
            experiencia: 2,
            formacao: "Sistemas de Informação",
            certificacoes: ["React Developer Certification"]
        },
        {
            id: 5, nome: "Diego Lima",
            skills: ["Java", "Spring Boot", "MySQL"],
            experiencia: 8,
            formacao: "Mestrado em Engenharia",
            certificacoes: ["Oracle Certified Professional"]
        },
        {
            id: 6, nome: "Mateus Oliveira",
            skills: ["React", "Node.js", "AWS"],
            experiencia: 5,
            formacao: "Análise de Sistemas",
            certificacoes: []
        }
    ]);

    const adicionarVaga = async () => { //criar vaga
        if (novaVagaCargo.trim() === '') return;

        const novaVagaDTO = {
            cargo: novaVagaCargo,
            skillsExigidas: ["Java", "Spring Boot", "React"],
            experienciaMinima: 1
        };

        try {
            await vagaService.criar(novaVagaDTO);
            await carregarVagas();
            setNovaVagaCargo('');
            setShowModal(false);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                const mensagens = error.response.data.map(err => err.mensagem).join("\n");
                alert("Erro de Validação:\n" + mensagens);
            } else {
                alert("Erro ao conectar com o servidor.");
            }
        }
    };

    const calcularMatch = (talento, vaga) => {
        if (!vaga?.skillsExigidas || !talento?.skills) return 0;

        const skillsCompativeis = talento.skills.filter(s => vaga.skillsExigidas.includes(s)).length;
        let notaTecnicaBase = (skillsCompativeis / vaga.skillsExigidas.length) * 100;

        if (talento.certificacoes?.length > 0) notaTecnicaBase += 15;

        const cursosElite = ["Engenharia", "Ciência da Computação", "Sistemas"];
        const temFormacaoBase = cursosElite.some(curso => talento.formacao.includes(curso));
        if (temFormacaoBase) notaTecnicaBase += 10;

        const notaTecnicaFinal = Math.min(notaTecnicaBase, 100);
        const scoreTecnico = (notaTecnicaFinal * pesoSkills) / 100;

        const expMin = vaga.experienciaMinima || 1;
        let scoreExp = (talento.experiencia / expMin) * pesoExp;
        if (scoreExp > pesoExp) scoreExp = pesoExp;

        return Math.round(scoreTecnico + scoreExp);
    };

    const encerrarVaga = async (id) => { //delete vaga
        if(window.confirm("Deseja realmente encerrar esta vaga?")) {
            try {
                await vagaService.deletar(id);
                setVagas(vagas.filter(vaga => vaga.id !== id));
                setMenuAberto(null);
            } catch (error) {
                alert("Erro ao excluir vaga do banco.");
            }
        }
    };

    const talentosFiltrados = talentos.filter(t => {
        const nome = t?.nome?.toLowerCase() || "";
        const formacao = t?.formacao?.toLowerCase() || "";
        const skillsString = Array.isArray(t?.skills) ? t.skills.join(' ').toLowerCase() : "";
        const termoBusca = busca.toLowerCase();
        return nome.includes(termoBusca) ||
            formacao.includes(termoBusca) ||
            skillsString.includes(termoBusca);
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

    return (
        <div className="feed-container">
            <nav className="user-header">
                <div className="header-inner">
                    <div className="header-left">
                        <img src={logoImg} alt="Help Logo" className="header-logo" />
                        <div className="search-bar">
                            <Search size={18} color="#9ca3af" />
                            <input
                                type="text"
                                placeholder="Buscar talentos..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="header-right-nav">
                        <div
                            className={`nav-item ${abaAtiva === 'painel' ? 'active' : ''}`}
                            onClick={() => setAbaAtiva('painel')}
                        >
                            <TrendingUp size={22}/>
                            <span>Painel</span>
                        </div>

                        <div
                            className={`nav-item ${abaAtiva === 'vagas' ? 'active' : ''}`}
                            onClick={() => setAbaAtiva('vagas')}
                        >
                            <Briefcase size={22}/>
                            <span>Vagas</span>
                        </div>

                        <div
                            className={`nav-item ${abaAtiva === 'talentos' ? 'active' : ''}`}
                            onClick={() => setAbaAtiva('talentos')}
                        >
                            <Users size={22}/>
                            <span>Talentos</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="feed-content rh-layout">
                {abaAtiva === 'painel' && (
                    <>
                     <aside className="left-column">
                      <div className="profile-card-dark">
                        <h4 className="section-title" style={{ marginBottom: '15px', fontSize: '14px', color: '#a755f7' }}>
                            Resumo Semanal
                        </h4>
                        <div className="rh-stat-item">
                            <span>Vagas Ativas</span>
                            <span className="text-purple">{vagas.length}</span>
                        </div>

                        <div className="rh-stat-item">
                            <span>Total Aprovados</span>
                            <span className="text-purple" style={{ color: '#22c55e' }}>
                                {Object.values(statusCandidatos).filter(status => status === 'aprovado').length}
                            </span>
                        </div>

                        <div className="rh-stat-item" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontSize: '12px', color: '#b8b8b8' }}>Taxa de Aprovação</span>
                            <span style={{ fontSize: '12px' }}>
                                {(() => {
                                    const totalInscritos = vagas.reduce((acc, v) => acc + (v.inscritos?.length || 0), 0);
                                    const totalAprovados = Object.values(statusCandidatos).filter(s => s === 'aprovado').length;
                                    if (totalInscritos === 0) return "0";
                                    return Math.round((totalAprovados / totalInscritos) * 100);
                                })()}%
                            </span>
                        </div>
                    </div>
                </aside>

                <section className="main-column">
                    <div className="create-post-container">
                        <div className="post-input-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <h3 style={{fontSize: '18px', fontWeight: '700'}}>Suas Vagas Ativas</h3>
                            <button className="btn-primary-rh" onClick={() => setShowModal(true)}>
                                <Plus size={18} /> Publicar Nova Vaga
                            </button>
                        </div>
                    </div>

                    {vagas.map((vaga) => (
                        <div className="post rh-vaga-card" key={vaga.id} style={{ overflow: 'hidden' }}>
                            <div className="rh-vaga-content">
                                <div className="vaga-info">
                                    <h4>{vaga.cargo}</h4>
                                    <p>Publicada • <strong>{(vaga.inscritos?.length || 0)} Candidatos</strong></p>
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
                                    <button
                                        className="btn-icon-more-clean"
                                        onClick={() => setMenuAberto(menuAberto === vaga.id ? null : vaga.id)}
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    {menuAberto === vaga.id && (
                                        <>
                                            <div
                                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }}
                                                onClick={() => setMenuAberto(null)}
                                            />
                                            <div className="dropdown-menu" style={{ zIndex: 10 }}>
                                                <div className="dropdown-item"><Edit3 size={14}/> Editar</div>
                                                <div className="dropdown-divider"></div>
                                                <div className="dropdown-item delete" onClick={() => encerrarVaga(vaga.id)}>
                                                    <Ban size={14}/> Excluir
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {vagaSelecionada === vaga.id && (
                                <div
                                    className="candidates-list"
                                    onScroll={carregarMaisItens}
                                    style={{
                                        padding: '20px',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                        maxHeight: '400px',
                                        overflowY: 'auto',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{
                                        background: 'rgba(167, 85, 247, 0.05)',
                                        padding: '15px',
                                        borderRadius: '12px',
                                        marginBottom: '10px',
                                        border: '1px dashed rgba(167, 85, 247, 0.3)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <h5 style={{ color: '#a755f7', fontSize: '11px', letterSpacing: '1px' }}>⚙️ PESOS DO MATCH</h5>
                                        </div>
                                        <div style={{ display: 'flex', gap: '20px' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '9px', color: '#b8b8b8', display: 'block', marginBottom: '5px' }}>TÉCNICO: {pesoSkills}%</label>
                                                <input
                                                    type="range" min="0" max="100" value={pesoSkills}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setPesoSkills(val);
                                                        setPesoExp(100 - val);
                                                    }}
                                                    style={{ width: '100%', accentColor: '#a755f7' }}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '9px', color: '#b8b8b8', display: 'block', marginBottom: '5px' }}>EXPERIÊNCIA: {pesoExp}%</label>
                                                <input
                                                    type="range" min="0" max="100" value={pesoExp}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setPesoExp(val);
                                                        setPesoSkills(100 - val);
                                                    }}
                                                    style={{ width: '100%', accentColor: '#a755f7' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {talentos
                                        .filter(t =>
                                            vaga.inscritos?.includes(t.id) &&
                                            (t.nome.toLowerCase().includes(busca.toLowerCase()) ||
                                                t.skills.join(' ').toLowerCase().includes(busca.toLowerCase()))
                                        )
                                        .sort((a, b) => calcularMatch(b, vaga) - calcularMatch(a, vaga))
                                        .slice(0, itensVisiveis)
                                        .map(candidato => {
                                            const chave = `${vaga.id}-${candidato.id}`;
                                            const status = statusCandidatos[chave];
                                            const score = calcularMatch(candidato, vaga);
                                            const corMatch = score > 75 ? '#22c55e' : score > 45 ? '#eab308' : '#ef4444';

                                            return (
                                                <div key={candidato.id} className={`candidate-item ${status}`} style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    background: status === 'aprovado' ? 'rgba(34, 197, 94, 0.1)' :
                                                        status === 'reprovado' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${status ? 'transparent' : 'rgba(255,255,255,0.05)'}`
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                            <div className="avatar-mini-rh" style={{ width: '40px', height: '40px' }}></div>
                                                            <div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>
                                                                        {candidato.nome} {status === 'aprovado' && '✓'}
                                                                    </p>

                                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                                        {candidato.certificacoes?.length > 0 && <span title="Possui Certificações" style={{ fontSize: '12px' }}>📜</span>}
                                                                        {["Engenharia", "Ciência", "Sistemas"].some(c => candidato.formacao?.includes(c)) && <span title="Formação na Área" style={{ fontSize: '12px' }}>🎓</span>}
                                                                    </div>
                                                                </div>
                                                                <p style={{ fontSize: '11px', color: '#b8b8b8' }}>
                                                                    {candidato.formacao} • {candidato.skills.join(' • ')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: corMatch }}>{score}%</span>
                                                            <p style={{ fontSize: '9px', color: '#b8b8b8', letterSpacing: '1px' }}>MATCH</p>
                                                        </div>
                                                    </div>

                                                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', marginTop: '12px' }}>
                                                        <div style={{ width: `${score}%`, height: '100%', background: corMatch, borderRadius: '10px', transition: 'width 0.8s' }}></div>
                                                    </div>

                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '11px', color: '#a755f7', fontWeight: '500' }}>
                                                        {candidato.experiencia} anos de experiência
                                                    </span>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button onClick={() => alterarStatusCandidato(vaga.id, candidato.id, 'aprovado')} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Aprovar</button>
                                                            <button onClick={() => alterarStatusCandidato(vaga.id, candidato.id, 'reprovado')} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '11px' }}>Reprovar</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                    {vaga.inscritos?.length > 0 && talentos.filter(t =>
                                        vaga.inscritos.includes(t.id) &&
                                        (t.nome.toLowerCase().includes(busca.toLowerCase()) ||
                                            t.skills.join(' ').toLowerCase().includes(busca.toLowerCase()))
                                    ).length === 0 && (
                                        <p style={{ textAlign: 'center', color: '#b8b8b8', fontSize: '13px', padding: '20px' }}>
                                            Nenhum candidato encontrado para esta busca.
                                        </p>
                                    )}

                                    {(!vaga.inscritos || vaga.inscritos.length === 0) ? (
                                        <p style={{ textAlign: 'center', color: '#b8b8b8', fontSize: '13px', padding: '20px' }}>
                                            Nenhum candidato inscrito para esta vaga ainda.
                                        </p>
                                    ) : (
                                        itensVisiveis < vaga.inscritos.length && (
                                            <p style={{ textAlign: 'center', fontSize: '11px', color: '#a755f7', marginTop: '10px', opacity: 0.7 }}>
                                                Carregando mais talentos...
                                            </p>
                                        )
                                    )}
                                    <div style={{ height: '1px', minHeight: '1px' }}></div>
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
                                    <span style={{ fontSize: '11px', color: '#a755f7', display: 'block', marginBottom: '4px' }}>
                                        {talento.formacao}
                                    </span>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {talento.skills?.slice(0, 3).map((skill, index) => (
                                            <span key={index} style={{
                                                fontSize: '9px',
                                                background: 'rgba(167, 85, 247, 0.1)',
                                                color: '#a755f7',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                border: '1px solid rgba(167, 85, 247, 0.2)'
                                            }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
                    </>
                )}
                {abaAtiva === 'talentos' && (
                    <Talentos talentosFiltrados={talentosFiltrados} />
                )}
            </main>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Publicar Nova Vaga</h3>
                            <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <label className="modal-label">Nome do Cargo</label>
                            <input
                                type="text"
                                className="modal-input"
                                placeholder="Ex: Desenvolvedor Backend"
                                value={novaVagaCargo}
                                onChange={(e) => setNovaVagaCargo(e.target.value)}
                            />
                            <button className="modal-confirm-btn" onClick={adicionarVaga}>
                                Confirmar Publicação
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardRH;
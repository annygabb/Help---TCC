import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, Briefcase, Plus, TrendingUp, Search,
    FileText, CheckCircle, MoreVertical, X,
    Edit3, Ban
} from 'lucide-react';
import { vagaService } from '../pages/VagaServiceEmpresa';
import logoImg from '../assets/logo.png';
import './DashboardRH.css';
import Talentos from './Talentos';
import VagasRH from './VagasRH';
import { calcularMatchIA } from './matchIA';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080'
});

const DashboardRH = () => {
    const [busca, setBusca] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [menuAberto, setMenuAberto] = useState(null);
    const [vagaSelecionada, setVagaSelecionada] = useState(null);
    const [statusCandidatos, setStatusCandidatos] = useState({});
    const [itensVisiveis, setItensVisiveis] = useState(3);
    const [pesoSkills, setPesoSkills] = useState(50);
    const [pesoExp, setPesoExp] = useState(50);
    const [abaAtiva, setAbaAtiva] = useState('painel');

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

    const [talentos] = useState([
        {
            id: 1,
            nome: "Lucas Silva",
            skills: ["React", "Node.js", "TypeScript", "AWS"],
            experiencia: 5,
            formacao: "Bacharel em Engenharia de Software",
            certificacoes: ["AWS Certified Solutions Architect"],
            senioridade: "Pleno",
            area: "Devs",
            pretensaoSalarial: 9000,
            localizacao: "São Paulo, SP",
            disponibilidade: "Disponivel"
        },
        {
            id: 2,
            nome: "Ana Costa",
            skills: ["Figma", "UI/UX", "Adobe XD"],
            experiencia: 3,
            formacao: "Design de Produto",
            certificacoes: ["Google UX Design Professional"],
            senioridade: "Pleno",
            area: "Designers",
            pretensaoSalarial: 7000,
            localizacao: "Goiânia, GO",
            disponibilidade: "Disponivel"
        },
        {
            id: 3,
            nome: "Bruno Melo",
            skills: ["Python", "Django", "PostgreSQL", "Docker"],
            experiencia: 4,
            formacao: "Ciência da Computação",
            certificacoes: [],
            senioridade: "Pleno",
            area: "Devs",
            pretensaoSalarial: 8500,
            localizacao: "Remoto",
            disponibilidade: "Em análise"
        },
        {
            id: 4,
            nome: "Carla Souza",
            skills: ["React", "JavaScript", "Tailwind"],
            experiencia: 2,
            formacao: "Sistemas de Informação",
            certificacoes: ["React Developer Certification"],
            senioridade: "Junior",
            area: "Devs",
            pretensaoSalarial: 5000,
            localizacao: "Anápolis, GO",
            disponibilidade: "Disponivel"
        },
        {
            id: 5,
            nome: "Diego Lima",
            skills: ["Java", "Spring Boot", "MySQL"],
            experiencia: 8,
            formacao: "Mestrado em Engenharia",
            certificacoes: ["Oracle Certified Professional"],
            senioridade: "Senior",
            area: "Devs",
            pretensaoSalarial: 14000,
            localizacao: "Brasília, DF",
            disponibilidade: "Disponivel"
        },
        {
            id: 6,
            nome: "Mateus Oliveira",
            skills: ["React", "Node.js", "AWS"],
            experiencia: 5,
            formacao: "Análise de Sistemas",
            certificacoes: [],
            senioridade: "Pleno",
            area: "Devs",
            pretensaoSalarial: 8000,
            localizacao: "Remoto",
            disponibilidade: "Disponivel"
        }
    ]);

    const [vagas, setVagas] = useState([
        {
            id: 1,
            cargo: "Desenvolvedor Front-End React",
            data: "10 de Out",
            inscritos: [1, 2, 3, 4],
            skillsExigidas: ["React", "TypeScript", "JavaScript"],
            experienciaMinima: 3,
            tipoExperiencia: "anos",
            modelo: "Remoto",
            tipo: "CLT",
            status: "ativa",
            senioridade: "Pleno",
            localizacao: "São Paulo, SP",
            salario: "R$ 6.000 - R$ 8.000",
            prioridade: "alta",
            descricao: "Atuação no desenvolvimento de interfaces modernas, integração com APIs e colaboração com o time de produto."
        },
        {
            id: 2,
            cargo: "Designer UI/UX",
            data: "12 de Out",
            inscritos: [2, 6],
            skillsExigidas: ["Figma", "UI/UX"],
            experienciaMinima: 2,
            tipoExperiencia: "anos",
            modelo: "Híbrido",
            tipo: "PJ",
            status: "ativa",
            senioridade: "Pleno",
            localizacao: "Goiânia, GO",
            salario: "R$ 4.500 - R$ 6.500",
            prioridade: "media",
            descricao: "Criação de fluxos, protótipos e interfaces para produtos digitais com foco em experiência do usuário."
        }
    ]);

    const adicionarVaga = () => {
        if (!novaVaga.cargo.trim()) return;

        const dataAtual = new Date();
        const dia = dataAtual.getDate();
        const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const dataString = `${dia} de ${meses[dataAtual.getMonth()]}`;

        const valorExperiencia = novaVaga.tipoExperiencia === 'nenhuma'
            ? 0
            : Number(novaVaga.experienciaMinima) || 0;

        const vaga = {
            id: Date.now(),
            cargo: novaVaga.cargo,
            data: dataString,
            inscritos: [],
            skillsExigidas: novaVaga.skills.split(',').map(s => s.trim()).filter(Boolean),
            experienciaMinima: valorExperiencia,
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

        setVagas(prev => [vaga, ...prev]);
        resetNovaVaga();
        setShowModal(false);
    };

    const calcularMatch = (talento, vaga) => {
        return calcularMatchIA(talento, vaga, { pesoSkills, pesoExp }).score;
    };

    const analisarMatchIA = (talento, vaga) => {
        return calcularMatchIA(talento, vaga, { pesoSkills, pesoExp });
    };

    const encerrarVaga = (id) => {
        if (window.confirm("Deseja realmente encerrar esta vaga?")) {
            setVagas(vagas.map(vaga =>
                vaga.id === id ? { ...vaga, status: "encerrada" } : vaga
            ));
            setMenuAberto(null);
        }
    };

    const excluirVaga = (id) => {
        if (window.confirm("Deseja realmente excluir esta vaga?")) {
            setVagas(vagas.filter(vaga => vaga.id !== id));
            setMenuAberto(null);
        }
    };

    const reabrirVaga = (id) => {
        setVagas(vagas.map(vaga =>
            vaga.id === id ? { ...vaga, status: "ativa" } : vaga
        ));
        setMenuAberto(null);
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
                        <div className="search-bar">
                            <Search size={18} color="#9ca3af" />
                            <input
                                type="text"
                                placeholder="Buscar talentos ou vagas..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="header-right-nav">
                        <div className={`nav-item ${abaAtiva === 'painel' ? 'active' : ''}`} onClick={() => setAbaAtiva('painel')}>
                            <TrendingUp size={22} /><span>Painel</span>
                        </div>
                        <div className={`nav-item ${abaAtiva === 'vagas' ? 'active' : ''}`} onClick={() => setAbaAtiva('vagas')}>
                            <Briefcase size={22} /><span>Vagas</span>
                        </div>
                        <div className={`nav-item ${abaAtiva === 'talentos' ? 'active' : ''}`} onClick={() => setAbaAtiva('talentos')}>
                            <Users size={22} /><span>Talentos</span>
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
                                    <span className="text-purple">
                                        {vagas.filter(v => v.status === 'ativa').length}
                                    </span>
                                </div>
                                <div className="rh-stat-item">
                                    <span>Total Aprovados</span>
                                    <span className="text-purple" style={{ color: '#22c55e' }}>
                                        {Object.values(statusCandidatos).filter(s => s === 'aprovado').length}
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
                                                            <div className="dropdown-item"><Edit3 size={14} /> Editar</div>
                                                            <div className="dropdown-divider"></div>
                                                            <div className="dropdown-item delete" onClick={() => excluirVaga(vaga.id)}><Ban size={14} /> Excluir</div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {vagaSelecionada === vaga.id && (
                                            <div
                                                className="candidates-list"
                                                onScroll={carregarMaisItens}
                                                style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}
                                            >
                                                <div style={{ background: 'rgba(167, 85, 247, 0.05)', padding: '15px', borderRadius: '12px', marginBottom: '10px', border: '1px dashed rgba(167, 85, 247, 0.3)' }}>
                                                    <h5 style={{ color: '#a755f7', fontSize: '11px', letterSpacing: '1px', marginBottom: '10px' }}>
                                                        PESOS DO MATCH
                                                    </h5>
                                                    <div style={{ display: 'flex', gap: '20px' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ fontSize: '9px', color: '#b8b8b8', display: 'block', marginBottom: '5px' }}>TÉCNICO: {pesoSkills}%</label>
                                                            <input type="range" min="0" max="100" value={pesoSkills} onChange={(e) => { const val = Number(e.target.value); setPesoSkills(val); setPesoExp(100 - val); }} style={{ width: '100%', accentColor: '#a755f7' }} />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ fontSize: '9px', color: '#b8b8b8', display: 'block', marginBottom: '5px' }}>EXPERIÊNCIA: {pesoExp}%</label>
                                                            <input type="range" min="0" max="100" value={pesoExp} onChange={(e) => { const val = Number(e.target.value); setPesoExp(val); setPesoSkills(100 - val); }} style={{ width: '100%', accentColor: '#a755f7' }} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {talentos
                                                    .filter(t =>
                                                        vaga.inscritos?.includes(t.id) &&
                                                        (t.nome.toLowerCase().includes(busca.toLowerCase()) || t.skills.join(' ').toLowerCase().includes(busca.toLowerCase()))
                                                    )
                                                    .sort((a, b) => calcularMatch(b, vaga) - calcularMatch(a, vaga))
                                                    .slice(0, itensVisiveis)
                                                    .map(candidato => {
                                                        const chave = `${vaga.id}-${candidato.id}`;
                                                        const status = statusCandidatos[chave];
                                                        const analiseIA = analisarMatchIA(candidato, vaga);
                                                        const score = analiseIA.score;
                                                        const corMatch = analiseIA.cor;

                                                        return (
                                                            <div
                                                                key={candidato.id}
                                                                className={`candidate-item ${status || ''}`}
                                                                style={{ display: 'flex', flexDirection: 'column', padding: '16px', borderRadius: '12px', background: status === 'aprovado' ? 'rgba(34, 197, 94, 0.1)' : status === 'reprovado' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${status ? 'transparent' : 'rgba(255,255,255,0.05)'}` }}
                                                            >
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                                        <div className="avatar-mini-rh" style={{ width: '40px', height: '40px' }}></div>
                                                                        <div>
                                                                            <p style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0 }}>
                                                                                {candidato.nome} {status === 'aprovado' && '✓'}
                                                                            </p>
                                                                            <p style={{ fontSize: '11px', color: '#b8b8b8', margin: '4px 0 0' }}>
                                                                                {candidato.formacao} • {candidato.skills.join(' • ')}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ textAlign: 'right' }}>
                                                                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: corMatch }}>{score}%</span>
                                                                        <p style={{ fontSize: '9px', color: '#b8b8b8', letterSpacing: '1px', margin: 0 }}>MATCH</p>
                                                                    </div>
                                                                </div>

                                                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', marginTop: '12px' }}>
                                                                    <div style={{ width: `${score}%`, height: '100%', background: corMatch, borderRadius: '10px' }}></div>
                                                                </div>

                                                                <div className="ia-match-box">
                                                                    <strong>IA: {analiseIA.recomendacao}</strong>
                                                                    <span>{analiseIA.resumo}</span>
                                                                    <div>
                                                                        {analiseIA.pontosFortes.slice(0, 2).map((ponto) => (
                                                                            <small key={ponto} className="ia-positive">{ponto}</small>
                                                                        ))}
                                                                        {analiseIA.pontosAtencao.slice(0, 2).map((ponto) => (
                                                                            <small key={ponto} className="ia-warning">{ponto}</small>
                                                                        ))}
                                                                    </div>
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

                                                {(!vaga.inscritos || vaga.inscritos.length === 0) && (
                                                    <p style={{ textAlign: 'center', color: '#b8b8b8', fontSize: '13px', padding: '20px' }}>
                                                        Nenhum candidato inscrito para esta vaga ainda.
                                                    </p>
                                                )}
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
                    />
                )}

                {abaAtiva === 'talentos' && (
                    <Talentos talentosFiltrados={talentosFiltrados} />
                )}
            </main>

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
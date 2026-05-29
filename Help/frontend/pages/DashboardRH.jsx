import React, { useState, useEffect } from 'react';
<<<<<<< HEAD:Help/frontend/src/pages/DashboardRH.jsx
import { Link } from 'react-router-dom';
=======
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/DashboardRH.jsx
import {
    Users, Briefcase, Plus, TrendingUp, Search,
    FileText, CheckCircle, MoreVertical, X,
    Edit3, Share2, Ban
} from 'lucide-react';
<<<<<<< HEAD:Help/frontend/src/pages/DashboardRH.jsx
import { vagaService } from '../pages/VagaServiceEmpresa';
import logoImg from '../assets/logo.png';
import './DashboardRH.css';
import Talentos from './Talentos';
import VagasRH from './VagasRH';

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
const [vagas, setVagas] = useState([]);
const [novaVagaCargo, setNovaVagaCargo] = useState('');
const [novaVagaSkills, setNovaVagaSkills] = useState('');
const [novaVagaExperiencia, setNovaVagaExperiencia] = useState('');
const [novaVagaUnidadeExp, setNovaVagaUnidadeExp] = useState('anos'); // 'anos' | 'meses' | 'nenhuma'
const [novaVagaModelo, setNovaVagaModelo] = useState('Remoto');
const [novaVagaTipo, setNovaVagaTipo] = useState('CLT');
const [novaVagaSenioridade, setNovaVagaSenioridade] = useState('Júnior');
const [novaVagaLocalizacao, setNovaVagaLocalizacao] = useState('');
const [novaVagaSalario, setNovaVagaSalario] = useState('');
const [novaVagaSalarioBase, setNovaVagaSalarioBase] = useState('');
const [novaVagaPrioridade, setNovaVagaPrioridade] = useState('media');
const [novaVagaDescricao, setNovaVagaDescricao] = useState('');
=======
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
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/DashboardRH.jsx

    useEffect(() => {
        carregarVagas();
    }, []);

    const carregarVagas = async () => {
        try {
            const response = await vagaService.listarTodas();
<<<<<<< HEAD:Help/frontend/src/pages/DashboardRH.jsx
            setVagas(response.data || []);
=======
            setVagas(response.data);
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/DashboardRH.jsx
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

<<<<<<< HEAD:Help/frontend/src/pages/DashboardRH.jsx
=======
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

>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/DashboardRH.jsx
    const calcularMatch = (talento, vaga) => {
        if (!vaga?.skillsExigidas || !talento?.skills) return 0;

        const skillsCompativeis = talento.skills.filter(s => vaga.skillsExigidas.includes(s)).length;
        let notaTecnicaBase = (skillsCompativeis / vaga.skillsExigidas.length) * 100;

        if (talento.certificacoes?.length > 0) notaTecnicaBase += 15;

        const cursosElite = ["Engenharia", "Ciência da Computação", "Sistemas"];
<<<<<<< HEAD:Help/frontend/src/pages/DashboardRH.jsx
        const temFormacaoBase = cursosElite.some(curso => talento.formacao?.includes(curso));
=======
        const temFormacaoBase = cursosElite.some(curso => talento.formacao.includes(curso));
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/DashboardRH.jsx
        if (temFormacaoBase) notaTecnicaBase += 10;

        const notaTecnicaFinal = Math.min(notaTecnicaBase, 100);
        const scoreTecnico = (notaTecnicaFinal * pesoSkills) / 100;

        const expMin = vaga.experienciaMinima || 1;
        let scoreExp = (talento.experiencia / expMin) * pesoExp;
        if (scoreExp > pesoExp) scoreExp = pesoExp;

        return Math.round(scoreTecnico + scoreExp);
    };

<<<<<<< HEAD:Help/frontend/src/pages/DashboardRH.jsx
    const analisarMatchIA = (candidato, vaga) => {
        const score = calcularMatch(candidato, vaga);
        const skillsMatch = candidato.skills?.filter(s => vaga.skillsExigidas?.includes(s)) || [];
        const skillsFaltando = vaga.skillsExigidas?.filter(s => !candidato.skills?.includes(s)) || [];

        const pontosFortes = [];
        const pontosAtencao = [];

        if (skillsMatch.length > 0) pontosFortes.push(`✅ Skills: ${skillsMatch.join(', ')}`);
        if (candidato.certificacoes?.length > 0) pontosFortes.push(`📜 ${candidato.certificacoes.length} certificação(ões)`);
        if (candidato.experiencia >= (vaga.experienciaMinima || 1)) pontosFortes.push(`⭐ ${candidato.experiencia} anos de experiência`);

        if (skillsFaltando.length > 0) pontosAtencao.push(`⚠️ Falta: ${skillsFaltando.join(', ')}`);
        if (candidato.experiencia < (vaga.experienciaMinima || 1)) pontosAtencao.push(`⏳ Experiência abaixo do mínimo`);

        let recomendacao = '';
        let resumo = '';
        let cor = '';

        if (score >= 75) {
            recomendacao = 'RECOMENDADO';
            resumo = 'Candidato com alto alinhamento ao perfil da vaga.';
            cor = '#22c55e';
        } else if (score >= 45) {
            recomendacao = 'POTENCIAL';
            resumo = 'Candidato com bom potencial, porém com lacunas a avaliar.';
            cor = '#eab308';
        } else {
            recomendacao = 'BAIXO MATCH';
            resumo = 'Candidato com pouco alinhamento ao perfil exigido.';
            cor = '#ef4444';
        }

        return { score, recomendacao, resumo, pontosFortes, pontosAtencao, cor };
    };

    const adicionarVaga = async () => {
        if (novaVagaCargo.trim() === '') return;

        const salarioBaseNum = parseFloat(String(novaVagaSalarioBase).replace(',', '.'));
        if (!novaVagaSalarioBase || isNaN(salarioBaseNum) || salarioBaseNum <= 0) {
            alert("Informe um Salário Base válido.");
            return;
        }

        const novaVagaDTO = {
            cargo: novaVagaCargo,
            skillsExigidas: novaVagaSkills
                ? novaVagaSkills.split(',').map(s => s.trim()).filter(Boolean)
                : ["Java", "Spring Boot", "React"],
            experienciaMinima: novaVagaUnidadeExp === 'nenhuma' ? 0 : (novaVagaExperiencia ? Number(novaVagaExperiencia) : 1),
            modeloTrabalho: novaVagaModelo,
            tipoContratacao: novaVagaTipo,
            senioridade: novaVagaSenioridade,
            localizacao: novaVagaLocalizacao,
            faixaSalarial: novaVagaSalario,
            salarioBase: parseFloat(String(novaVagaSalarioBase).replace(',', '.')),
            prioridade: novaVagaPrioridade,
            descricao: novaVagaDescricao,
        };

        try {
            await vagaService.criar(novaVagaDTO);
            await carregarVagas();
            setNovaVagaCargo('');
            setNovaVagaSkills('');
            setNovaVagaExperiencia('');
            setNovaVagaUnidadeExp('anos');
            setNovaVagaModelo('Remoto');
            setNovaVagaTipo('CLT');
            setNovaVagaSenioridade('Júnior');
            setNovaVagaLocalizacao('');
            setNovaVagaSalario('');
            setNovaVagaSalarioBase('');
            setNovaVagaPrioridade('media');
            setNovaVagaDescricao('');
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

    const encerrarVaga = async (id) => {
        if (window.confirm("Deseja realmente encerrar esta vaga?")) {
=======
    const encerrarVaga = async (id) => { //delete vaga
        if(window.confirm("Deseja realmente encerrar esta vaga?")) {
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/DashboardRH.jsx
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
<<<<<<< HEAD:Help/frontend/src/pages/DashboardRH.jsx
                        <Link to="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            <img src={logoImg} alt="Help Logo" className="header-logo" style={{ cursor: 'pointer' }} />
                        </Link>
=======
                        <img src={logoImg} alt="Help Logo" className="header-logo" />
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/DashboardRH.jsx
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
<<<<<<< HEAD:Help/frontend/src/pages/DashboardRH.jsx

=======
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/DashboardRH.jsx
                    <div className="header-right-nav">
                        <div
                            className={`nav-item ${abaAtiva === 'painel' ? 'active' : ''}`}
                            onClick={() => setAbaAtiva('painel')}
                        >
<<<<<<< HEAD:Help/frontend/src/pages/DashboardRH.jsx
                            <TrendingUp size={22} />
=======
                            <TrendingUp size={22}/>
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/DashboardRH.jsx
                            <span>Painel</span>
                        </div>

                        <div
                            className={`nav-item ${abaAtiva === 'vagas' ? 'active' : ''}`}
                            onClick={() => setAbaAtiva('vagas')}
                        >
<<<<<<< HEAD:Help/frontend/src/pages/DashboardRH.jsx
                            <Briefcase size={22} />
=======
                            <Briefcase size={22}/>
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/DashboardRH.jsx
                            <span>Vagas</span>
                        </div>

                        <div
                            className={`nav-item ${abaAtiva === 'talentos' ? 'active' : ''}`}
                            onClick={() => setAbaAtiva('talentos')}
                        >
<<<<<<< HEAD:Help/frontend/src/pages/DashboardRH.jsx
                            <Users size={22} />
=======
                            <Users size={22}/>
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/DashboardRH.jsx
                            <span>Talentos</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="feed-content rh-layout">
                {abaAtiva === 'painel' && (
                    <>
<<<<<<< HEAD:Help/frontend/src/pages/DashboardRH.jsx
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
                                    <span style={{ color: '#22c55e' }}>
                                        {Object.values(statusCandidatos).filter(s => s === 'aprovado').length}
                                    </span>
                                </div>

                                <div className="rh-stat-item" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ fontSize: '12px', color: '#b8b8b8' }}>Taxa de Aprovação</span>
                                    <span style={{ fontSize: '12px' }}>
                                        {(() => {
                                            const totalInscritos = vagas.reduce((acc, v) => acc + ((v.inscritosIds || v.inscritos)?.length || 0), 0);
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

                            {vagas.map((vaga) => {
                                const listaInscritos = vaga.inscritosIds || vaga.inscritos || [];
                                return (
                                    <div className="post rh-vaga-card" key={vaga.id} style={{ overflow: 'hidden' }}>
                                        <div className="rh-vaga-content">
                                            <div className="vaga-info">
                                                <h4>{vaga.cargo}</h4>
                                                <p>Publicada • <strong>{listaInscritos.length} Candidatos</strong></p>
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
                                                            <div className="dropdown-item"><Edit3 size={14} /> Editar</div>
                                                            <div className="dropdown-divider"></div>
                                                            <div className="dropdown-item delete" onClick={() => encerrarVaga(vaga.id)}>
                                                                <Ban size={14} /> Excluir
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
                                                    <h5 style={{ color: '#a755f7', fontSize: '11px', letterSpacing: '1px', marginBottom: '10px' }}>
                                                        ⚙️ PESOS DO MATCH
                                                    </h5>
                                                    <div style={{ display: 'flex', gap: '20px' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <label style={{ fontSize: '9px', color: '#b8b8b8', display: 'block', marginBottom: '5px' }}>
                                                                TÉCNICO: {pesoSkills}%
                                                            </label>
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
                                                            <label style={{ fontSize: '9px', color: '#b8b8b8', display: 'block', marginBottom: '5px' }}>
                                                                EXPERIÊNCIA: {pesoExp}%
                                                            </label>
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
                                                        listaInscritos.includes(t.id) &&
                                                        (
                                                            t.nome?.toLowerCase().includes(busca.toLowerCase()) ||
                                                            t.skills?.join(' ').toLowerCase().includes(busca.toLowerCase())
                                                        )
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
                                                                style={{
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    padding: '16px',
                                                                    borderRadius: '12px',
                                                                    background: status === 'aprovado'
                                                                        ? 'rgba(34, 197, 94, 0.1)'
                                                                        : status === 'reprovado'
                                                                            ? 'rgba(239, 68, 68, 0.1)'
                                                                            : 'rgba(255,255,255,0.03)',
                                                                    border: `1px solid ${status ? 'transparent' : 'rgba(255,255,255,0.05)'}`
                                                                }}
                                                            >
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                                        <div className="avatar-mini-rh" style={{ width: '40px', height: '40px' }}></div>
                                                                        <div>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                <p style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0 }}>
                                                                                    {candidato.nome} {status === 'aprovado' && '✓'}
                                                                                </p>
                                                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                                                    {candidato.certificacoes?.length > 0 && (
                                                                                        <span title="Possui Certificações" style={{ fontSize: '12px' }}>📜</span>
                                                                                    )}
                                                                                    {["Engenharia", "Ciência", "Sistemas"].some(c => candidato.formacao?.includes(c)) && (
                                                                                        <span title="Formação na Área" style={{ fontSize: '12px' }}>🎓</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <p style={{ fontSize: '11px', color: '#b8b8b8', margin: '4px 0 0' }}>
                                                                                {candidato.formacao} • {candidato.skills?.join(' • ')}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div style={{ textAlign: 'right' }}>
                                                                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: corMatch }}>
                                                                            {score}%
                                                                        </span>
                                                                        <p style={{ fontSize: '9px', color: '#b8b8b8', letterSpacing: '1px', margin: 0 }}>
                                                                            MATCH
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', marginTop: '12px' }}>
                                                                    <div style={{ width: `${score}%`, height: '100%', background: corMatch, borderRadius: '10px', transition: 'width 0.8s' }}></div>
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
                                                                        <button
                                                                            onClick={() => alterarStatusCandidato(vaga.id, candidato.id, 'aprovado')}
                                                                            style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                                                                        >
                                                                            Aprovar
                                                                        </button>
                                                                        <button
                                                                            onClick={() => alterarStatusCandidato(vaga.id, candidato.id, 'reprovado')}
                                                                            style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '11px' }}
                                                                        >
                                                                            Reprovar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}

                                                {listaInscritos.length > 0 && talentos.filter(t =>
                                                    listaInscritos.includes(t.id) &&
                                                    (t.nome?.toLowerCase().includes(busca.toLowerCase()) ||
                                                        t.skills?.join(' ').toLowerCase().includes(busca.toLowerCase()))
                                                ).length === 0 && (
                                                    <p style={{ textAlign: 'center', color: '#b8b8b8', fontSize: '13px', padding: '20px' }}>
                                                        Nenhum candidato encontrado para esta busca.
                                                    </p>
                                                )}

                                                {listaInscritos.length === 0 ? (
                                                    <p style={{ textAlign: 'center', color: '#b8b8b8', fontSize: '13px', padding: '20px' }}>
                                                        Nenhum candidato inscrito para esta vaga ainda.
                                                    </p>
                                                ) : (
                                                    itensVisiveis < listaInscritos.length && (
                                                        <p style={{ textAlign: 'center', fontSize: '11px', color: '#a755f7', marginTop: '10px', opacity: 0.7 }}>
                                                            Carregando mais talentos...
                                                        </p>
                                                    )
                                                )}

                                                <div style={{ height: '1px', minHeight: '1px' }}></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </section>

                        <aside className="right-column">
                            <div className="rec-card">
                                <h4 style={{ marginBottom: '15px', fontSize: '16px' }}>
                                    Talentos Sugeridos
                                </h4>

                                {talentosFiltrados.map(talento => (
                                    <div className="talent-item" key={talento.id} style={{ marginBottom: '15px' }}>
                                        <div className="avatar-mini-rh"></div>

                                        <div className="talent-info">
                                            <strong style={{ display: 'block', fontSize: '14px' }}>
                                                {talento.nome}
                                            </strong>

                                            <span style={{ fontSize: '11px', color: '#a755f7', display: 'block', marginBottom: '4px' }}>
                                                {talento.formacao}
                                            </span>

                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                {talento.skills?.slice(0, 3).map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        style={{
                                                            fontSize: '9px',
                                                            background: 'rgba(167, 85, 247, 0.1)',
                                                            color: '#a755f7',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            border: '1px solid rgba(167, 85, 247, 0.2)'
                                                        }}
                                                    >
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

=======
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
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/DashboardRH.jsx
                {abaAtiva === 'talentos' && (
                    <Talentos talentosFiltrados={talentosFiltrados} />
                )}
            </main>

            {showModal && (
<<<<<<< HEAD:Help/frontend/src/pages/DashboardRH.jsx
                <div className="modal-overlay" style={{ zIndex: 1000 }}>
                    <div className="modal-content" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: '90vh',
                        overflow: 'hidden'
                    }}>
                        <div className="modal-header" style={{ flexShrink: 0 }}>
=======
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/DashboardRH.jsx
                            <h3>Publicar Nova Vaga</h3>
                            <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
<<<<<<< HEAD:Help/frontend/src/pages/DashboardRH.jsx

                        <div className="modal-body" style={{
                            overflowY: 'auto',
                            flex: 1,
                            paddingRight: '4px'
                        }}>
=======
                        <div className="modal-body">
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/DashboardRH.jsx
                            <label className="modal-label">Nome do Cargo</label>
                            <input
                                type="text"
                                className="modal-input"
                                placeholder="Ex: Desenvolvedor Backend"
                                value={novaVagaCargo}
                                onChange={(e) => setNovaVagaCargo(e.target.value)}
                            />
<<<<<<< HEAD:Help/frontend/src/pages/DashboardRH.jsx

                            <label className="modal-label">Skills exigidas</label>
                            <input
                                type="text"
                                className="modal-input"
                                placeholder="Ex: React, Node.js, TypeScript"
                                value={novaVagaSkills}
                                onChange={(e) => setNovaVagaSkills(e.target.value)}
                            />

                            <label className="modal-label">Experiência mínima</label>

                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                {['anos', 'meses', 'nenhuma'].map((opcao) => (
                                    <button
                                        key={opcao}
                                        type="button"
                                        onClick={() => {
                                            setNovaVagaUnidadeExp(opcao);
                                            if (opcao === 'nenhuma') setNovaVagaExperiencia('');
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '7px 0',
                                            borderRadius: '8px',
                                            border: novaVagaUnidadeExp === opcao
                                                ? '2px solid #a755f7'
                                                : '1px solid rgba(255,255,255,0.15)',
                                            background: novaVagaUnidadeExp === opcao
                                                ? 'rgba(167, 85, 247, 0.15)'
                                                : 'transparent',
                                            color: novaVagaUnidadeExp === opcao ? '#a755f7' : '#b8b8b8',
                                            fontSize: '12px',
                                            fontWeight: novaVagaUnidadeExp === opcao ? '700' : '400',
                                            cursor: 'pointer',
                                            textTransform: 'capitalize',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {opcao.charAt(0).toUpperCase() + opcao.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <input
                                type="number"
                                className="modal-input"
                                placeholder={
                                    novaVagaUnidadeExp === 'nenhuma'
                                        ? 'Sem exigência de experiência'
                                        : novaVagaUnidadeExp === 'meses'
                                            ? 'Ex: 6 meses'
                                            : 'Ex: 3 anos'
                                }
                                min="0"
                                value={novaVagaExperiencia}
                                disabled={novaVagaUnidadeExp === 'nenhuma'}
                                onChange={(e) => setNovaVagaExperiencia(e.target.value)}
                                style={{
                                    opacity: novaVagaUnidadeExp === 'nenhuma' ? 0.4 : 1,
                                    cursor: novaVagaUnidadeExp === 'nenhuma' ? 'not-allowed' : 'text'
                                }}
                            />

                            <label className="modal-label">Modelo de trabalho</label>
                            <select
                                className="modal-input"
                                value={novaVagaModelo}
                                onChange={(e) => setNovaVagaModelo(e.target.value)}
                                style={{ position: 'relative', zIndex: 10 }}
                            >
                                <option value="Remoto">Remoto</option>
                                <option value="Híbrido">Híbrido</option>
                                <option value="Presencial">Presencial</option>
                            </select>

                            <label className="modal-label">Tipo de contratação</label>
                            <select
                                className="modal-input"
                                value={novaVagaTipo}
                                onChange={(e) => setNovaVagaTipo(e.target.value)}
                                style={{ position: 'relative', zIndex: 10 }}
                            >
                                <option value="CLT">CLT</option>
                                <option value="PJ">PJ</option>
                                <option value="Estágio">Estágio</option>
                                <option value="Freelancer">Freelancer</option>
                            </select>

                            <label className="modal-label">Senioridade</label>
                            <select
                                className="modal-input"
                                value={novaVagaSenioridade}
                                onChange={(e) => setNovaVagaSenioridade(e.target.value)}
                                style={{ position: 'relative', zIndex: 10 }}
                            >
                                <option value="Júnior">Júnior</option>
                                <option value="Pleno">Pleno</option>
                                <option value="Sênior">Sênior</option>
                                <option value="Especialista">Especialista</option>
                            </select>

                            <label className="modal-label">Localização</label>
                            <input
                                type="text"
                                className="modal-input"
                                placeholder="Ex: São Paulo, SP"
                                value={novaVagaLocalizacao}
                                onChange={(e) => setNovaVagaLocalizacao(e.target.value)}
                            />

                            <label className="modal-label">Faixa salarial</label>
                            <input
                                type="text"
                                className="modal-input"
                                placeholder="Ex: R$ 6.000 - R$ 8.000"
                                value={novaVagaSalario}
                                onChange={(e) => setNovaVagaSalario(e.target.value)}
                            />

                            <label className="modal-label">Salário Base</label>
                            <input
                                type="text"
                                className="modal-input"
                                placeholder="Ex: R$ 7.000"
                                value={novaVagaSalarioBase}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/[^\d,.]/g, '').replace(',', '.');
                                    setNovaVagaSalarioBase(raw);
                                }}
                            />

                            <label className="modal-label">Prioridade</label>
                            <select
                                className="modal-input"
                                value={novaVagaPrioridade}
                                onChange={(e) => setNovaVagaPrioridade(e.target.value)}
                                style={{ position: 'relative', zIndex: 10 }}
                            >
                                <option value="baixa">Baixa</option>
                                <option value="media">Média</option>
                                <option value="alta">Alta</option>
                            </select>

                            <label className="modal-label">Descrição</label>
                            <textarea
                                className="modal-input modal-textarea"
                                placeholder="Descreva responsabilidades, requisitos e diferenciais da vaga."
                                value={novaVagaDescricao}
                                onChange={(e) => setNovaVagaDescricao(e.target.value)}
                            />

=======
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/DashboardRH.jsx
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
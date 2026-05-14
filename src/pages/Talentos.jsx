import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Única adição externa necessária

import {
    UserPlus,
    Star,
    MessageCircle,
    Heart,
    Filter,
    X,
    Sparkles,
    Zap,
    Search
} from 'lucide-react';
import './Talentos.css';

const Talentos = () => {
    const [talentosDB, setTalentosDB] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const [favoritos, setFavoritos] = useState(() => {
        const favoritosSalvos =
            localStorage.getItem('favoritos');
        return favoritosSalvos
            ? new Set(JSON.parse(favoritosSalvos))
            : new Set();
    });

    const [talentoSelecionado, setTalentoSelecionado] = //talento selecionado
        useState(null);

    const [busca, setBusca] = useState('');//busca

    useEffect(() => {
        const buscarDados = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/vagas/talentos');
                setTalentosDB(response.data);
            } catch (error) {
                console.error("Erro ao carregar talentos:", error);
            } finally {
                setCarregando(false);
            }
        };
        buscarDados();
    }, []);

    useEffect(() => {//salvar favoritos
        localStorage.setItem(
            'favoritos',
            JSON.stringify([...favoritos])
        );
    }, [favoritos]);

    const toggleFavorito = (e, id) => {//favoritar
        e.stopPropagation();
        setFavoritos(prev => {
            const novoSet = new Set(prev);
            novoSet.has(id)
                ? novoSet.delete(id)
                : novoSet.add(id);
            return novoSet;
        });
    };

    const calcularCompatibilidade = (talento) => {//compatibilidade
        if (!talento) return 0;
        let score = 70;
        if (talento.experiencia >= 5) score += 10;
        if (talento.skills?.length >= 5) score += 10;
        if (talento.certificacoes?.length > 0) score += 5;
        return Math.min(score, 100);
    };
    const [senioridadesSelecionadas, setSenioridadesSelecionadas] = useState([]);

    const toggleSenioridade = (nivel) => {
        setSenioridadesSelecionadas((prev) => {
            if (prev.includes(nivel)) {
                return prev.filter(item => item !== nivel);
            }
            return [...prev, nivel];
        });
    };

    const talentos = talentosDB.filter((talento) => {//filtro de buscas
        const textoBusca = busca.toLowerCase();
        return (
            talento.nome?.toLowerCase().includes(textoBusca) ||
            talento.formacao?.toLowerCase().includes(textoBusca) ||
            talento.skills?.some(skill =>
                skill.toLowerCase().includes(textoBusca)
            )
        );

    });
    const [salario, setSalario] = useState(8000);

    if (carregando) return null; //Ou um loader simples se preferir

    return (

        <div className="talentos-layout-wrapper">
            <aside className="talentos-sidebar">
                <div className="sidebar-header">
                    <Filter size={18} color="#a755f7" />
                    <span>Filtros Avançados</span>
                </div>

                <div className="filter-group">
                    <label>Buscar Talentos</label>
                    <div className="search-wrapper">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Nome, skill ou formação..."
                            className="search-input"
                            value={busca}
                            onChange={(e) =>
                                setBusca(e.target.value)
                            }
                        />
                    </div>
                </div>

                <div className="filter-group">
                    <label>Senioridade</label>
                    {['Estagiário', 'Júnior', 'Pleno', 'Sênior']
                        .map((nivel) => (
                            <div
                                className="check-item"
                                key={nivel}
                            >
                                <input
                                    type="checkbox"
                                    id={nivel}
                                    checked={senioridadesSelecionadas.includes(nivel)}
                                    onChange={() => toggleSenioridade(nivel)}
                                />
                                <label htmlFor={nivel}>
                                    {nivel}
                                </label>
                            </div>
                        ))}
                </div>

                <div className="filter-group">
                    <label>Pretensão Salarial</label>
                    <span className="salary-text">
        R$ {salario.toLocaleString()}
    </span>
                    <input
                        type="range"
                        className="salary-slider"
                        min="2000"
                        max="20000"
                        step="500"
                        value={salario}
                        onChange={(e) =>
                            setSalario(Number(e.target.value))
                        }
                    />
                    <div className="range-values">
                        <span>2k</span>
                        <span>20k+</span>
                    </div>
                </div>
                <button className="btn-reset-filters" onClick={() => { setBusca(''); setSenioridadesSelecionadas([]); setSalario(8000); }}>
                    Limpar Tudo
                </button>
            </aside>

            <main className="talentos-page-container">
                <header className="talentos-header-v2">
                    <div className="header-text">
                        <h2 className="talentos-title">
                            Banco de Talentos Inteligente
                        </h2>
                        <p className="talentos-subtitle">
                            {talentos.length} talentos encontrados
                        </p>
                    </div>
                    <div className="filter-chips">
                        <button className="chip active">
                            Todos
                        </button>
                        <button className="chip">
                            Devs
                        </button>
                        <button className="chip">
                            Designers
                        </button>
                    </div>
                </header>

                <div className="talentos-grid">
                    {talentos.length > 0 ? (
                        talentos.map((talento) => (
                            <TalentoCard
                                key={talento.id}
                                talento={talento}
                                isSelected={
                                    talentoSelecionado?.id ===
                                    talento.id
                                }
                                isFavorito={
                                    favoritos.has(talento.id)
                                }
                                onSelect={() =>
                                    setTalentoSelecionado(talento)
                                }
                                onToggleFavorito={
                                    toggleFavorito
                                }
                            />
                        ))
                    ) : (
                        <div className="empty-state">
                            <Sparkles size={40} />
                            <h3>
                                Nenhum talento encontrado
                            </h3>
                            <p>
                                Tente ajustar os filtros
                                ou realizar outra busca.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {talentoSelecionado && (
                <ResumoAI
                    talento={talentoSelecionado}
                    compatibilidade={
                        calcularCompatibilidade(
                            talentoSelecionado
                        )
                    }
                    onClose={() =>
                        setTalentoSelecionado(null)
                    }
                />
            )}
        </div>
    );
};

const TalentoCard = ({
    talento,
    isSelected,
    isFavorito,
    onSelect,
    onToggleFavorito
}) => (

    <div
        className={`talento-card-v2 ${
    isSelected ? 'selected' : ''
}`}
        onClick={onSelect}
    >

        <div className="card-top">
            <div className="avatar-wrapper">
                <div className="talento-avatar-v2">
                    {talento.nome?.charAt(0)}
                </div>
                <div className="status-indicator online"></div>
            </div>
            <div className="main-meta">
                <h3>{talento.nome}</h3>
                <p>{talento.formacao}</p>
                <div className="exp-label">
                    <Star
                        size={14}
                        className="star-icon"
                    />
                    <span>
                        {talento.experiencia} anos exp.
                    </span>
                </div>
            </div>

            <button
                className={`fav-btn ${
    isFavorito ? 'active' : ''
}`}
                onClick={(e) =>
                    onToggleFavorito(e, talento.id)
                }
            >
                <Heart
                    size={20}
                    fill={
                        isFavorito
                            ? '#ef4444'
                            : 'transparent'
                    }
                    stroke={
                        isFavorito
                            ? '#ef4444'
                            : '#ccc'
                    }
                />
            </button>
        </div>

        <div className="skills-section">
            <div className="skills-grid-v2">
                {talento.skills
                    ?.slice(0, 4)
                    .map((skill) => (
                        <span
                            key={skill}
                            className="skill-pill-v2"
                        >
                            {skill}
                        </span>
                    ))}
            </div>
        </div>

        <div className="card-footer-v2">
            <button className="btn-chat-secundario">
                <MessageCircle size={18} />
            </button>
            <button className="btn-convidar-primario">
                <UserPlus size={18} />
                Convidar
            </button>
        </div>
    </div>
);

const ResumoAI = ({
    talento,
    compatibilidade,
    onClose
}) => (

    <aside className="resumo-ai-sidebar">
        <button
            className="btn-close-ai"
            onClick={onClose}
        >
            <X size={20} />
        </button>

        <div className="ai-resumo-header">
            <div className="ai-avatar">
                {talento.nome?.charAt(0)}
            </div>
            <div>
                <h3>{talento.nome}</h3>
                <p>{talento.formacao}</p>
            </div>
        </div>

        <div className="ai-match-stats">
            <div className="match-info-header">
                <div className="ai-tag">
                    <Zap size={14} />
                    Match IA
                </div>
                <span className="match-percentage">
                    {compatibilidade}%
                </span>
            </div>
            <div className="match-progress-bg">
                <div
                    className="match-progress-fill"
                    style={{
                        width: `${compatibilidade}%`
                    }}
                ></div>
            </div>
        </div>

        <div className="ai-analysis-box">
            <div className="ai-tag">
                <Sparkles size={14} />
                Resumo Inteligente
            </div>
            <p>
                Perfil{' '}
                <strong>
                    {talento.experiencia > 5
                        ? 'Especialista'
                        : 'Potencial'}
                </strong>
                {' '}com domínio em{' '}
                <strong>
                    {talento.skills?.join(', ')}
                </strong>
                . O candidato demonstra forte
                alinhamento para projetos de
                inovação e colaboração técnica.
            </p>
        </div>

        <button className="btn-agendar-entrevista">
            Agendar Entrevista
        </button>
    </aside>
);

export default Talentos;
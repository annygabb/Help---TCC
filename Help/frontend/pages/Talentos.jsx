<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
    Calendar,
    CheckCircle,
    Filter,
    Heart,
    MessageCircle,
    Search,
    Sparkles,
    Star,
    Users,
    UserPlus,
    X,
    Zap
} from 'lucide-react';
import './Talentos.css';
import { analisarTalentoIA } from './matchIA';

const senioridades = ['Estagiário', 'Júnior', 'Pleno', 'Sênior'];
const areas = ['Todos', 'Devs', 'Designers', 'Favoritos'];

const normalizarTalento = (talento) => {
    const senioridade =
        talento.senioridade ||
        (talento.experiencia >= 7 ? 'Sênior' :
            talento.experiencia >= 3 ? 'Pleno' :
                talento.experiencia >= 1 ? 'Júnior' : 'Estagiário');

    const area =
        talento.area ||
        (talento.skills?.some(skill => ['Figma', 'UI/UX', 'Adobe XD', 'Design'].includes(skill))
            ? 'Designers'
            : 'Devs');

    const pretensaoSalarial =
        talento.pretensaoSalarial ||
        (senioridade === 'Sênior' ? 14000 :
            senioridade === 'Pleno' ? 9000 :
                senioridade === 'Júnior' ? 5000 : 2500);

    return {
        localizacao: 'Brasil',
        disponibilidade: 'Disponível',
        certificacoes: [],
        ...talento,
        senioridade,
        area,
        pretensaoSalarial
    };
};
=======
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
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx

const Talentos = () => {
    const [talentosDB, setTalentosDB] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const [favoritos, setFavoritos] = useState(() => {
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
        const favoritosSalvos = localStorage.getItem('favoritosTalentosRH');
        return favoritosSalvos ? new Set(JSON.parse(favoritosSalvos)) : new Set();
    });

    const [convidados, setConvidados] = useState(() => {
        const convidadosSalvos = localStorage.getItem('convidadosTalentosRH');
        return convidadosSalvos ? new Set(JSON.parse(convidadosSalvos)) : new Set();
    });

    const [entrevistas, setEntrevistas] = useState(() => {
        const entrevistasSalvas = localStorage.getItem('entrevistasTalentosRH');
        return entrevistasSalvas ? new Set(JSON.parse(entrevistasSalvas)) : new Set();
    });

    const [talentoSelecionado, setTalentoSelecionado] = useState(null);
    const [busca, setBusca] = useState('');
    const [senioridadesSelecionadas, setSenioridadesSelecionadas] = useState([]);
    const [salario, setSalario] = useState(20000);
    const [areaAtiva, setAreaAtiva] = useState('Todos');
    const [ordenacao, setOrdenacao] = useState('match');
    const [mensagem, setMensagem] = useState('');
=======
        const favoritosSalvos =
            localStorage.getItem('favoritos');
        return favoritosSalvos
            ? new Set(JSON.parse(favoritosSalvos))
            : new Set();
    });

    const [talentoSelecionado, setTalentoSelecionado] = //talento selecionado
        useState(null);

    const [busca, setBusca] = useState('');//busca
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx

    useEffect(() => {
        const buscarDados = async () => {
            try {
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
                const token = localStorage.getItem('token');
                const config = {};
                if (token && token !== "null" && token !== "undefined") {
                    config.headers = { Authorization: `Bearer ${token}` };
                }

                const response = await axios.get('http://localhost:8080/api/vagas/talentos', config);
                setTalentosDB(response.data);
            } catch (error) {
                console.error("Erro ao carregar talentos da API:", error);
=======
                const response = await axios.get('http://localhost:8080/api/vagas/talentos');
                setTalentosDB(response.data);
            } catch (error) {
                console.error("Erro ao carregar talentos:", error);
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
            } finally {
                setCarregando(false);
            }
        };
        buscarDados();
    }, []);

<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
    useEffect(() => {
        localStorage.setItem('favoritosTalentosRH', JSON.stringify([...favoritos]));
    }, [favoritos]);

    useEffect(() => {
        localStorage.setItem('convidadosTalentosRH', JSON.stringify([...convidados]));
    }, [convidados]);

    useEffect(() => {
        localStorage.setItem('entrevistasTalentosRH', JSON.stringify([...entrevistas]));
    }, [entrevistas]);

    const talentosBase = useMemo(
        () => talentosDB.map(normalizarTalento),
        [talentosDB]
    );

    const calcularCompatibilidade = (talento) => {
        if (!talento) return 0;
        return analisarTalentoIA(talento)?.score || 0;
    };

    const talentos = useMemo(() => {
        const textoBusca = busca.toLowerCase();

        return talentosBase
            .filter(talento => {
                const bateBusca =
                    talento.nome?.toLowerCase().includes(textoBusca) ||
                    talento.formacao?.toLowerCase().includes(textoBusca) ||
                    talento.senioridade?.toLowerCase().includes(textoBusca) ||
                    talento.localizacao?.toLowerCase().includes(textoBusca) ||
                    talento.skills?.some(skill => skill.toLowerCase().includes(textoBusca));

                const bateSenioridade =
                    senioridadesSelecionadas.length === 0 ||
                    senioridadesSelecionadas.includes(talento.senioridade);

                const bateSalario = talento.pretensaoSalarial <= salario;
                const bateArea = areaAtiva === 'Todos' || areaAtiva === 'Favoritos' || talento.area === areaAtiva;
                const bateFavorito = areaAtiva !== 'Favoritos' || favoritos.has(talento.id);

                return bateBusca && bateSenioridade && bateSalario && bateArea && bateFavorito;
            })
            .sort((a, b) => {
                if (ordenacao === 'experiencia') return b.experiencia - a.experiencia;
                if (ordenacao === 'salario') return a.pretensaoSalarial - b.pretensaoSalarial;
                if (ordenacao === 'nome') return a.nome ? a.nome.localeCompare(b.nome) : 0;
                return calcularCompatibilidade(b) - calcularCompatibilidade(a);
            });
    }, [talentosBase, busca, senioridadesSelecionadas, salario, areaAtiva, favoritos, ordenacao]);

    const resumo = useMemo(() => ({
        total: talentosBase.length,
        favoritos: favoritos.size,
        convidados: convidados.size,
        entrevistas: entrevistas.size // <-- Corrigido aqui!
    }), [talentosBase.length, favoritos.size, convidados.size, entrevistas.size]);

    const toggleFavorito = (e, id) => {
        e.stopPropagation();
        setFavoritos(prev => {
            const novoSet = new Set(prev);
            novoSet.has(id) ? novoSet.delete(id) : novoSet.add(id);
=======
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
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
            return novoSet;
        });
    };

<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
    const toggleSenioridade = (nivel) => {
        setSenioridadesSelecionadas(prev =>
            prev.includes(nivel)
                ? prev.filter(item => item !== nivel)
                : [...prev, nivel]
        );
    };

    const limparFiltros = () => {
        setBusca('');
        setSenioridadesSelecionadas([]);
        setSalario(20000);
        setAreaAtiva('Todos');
        setOrdenacao('match');
    };

    const mostrarMensagem = (texto) => {
        setMensagem(texto);
        window.setTimeout(() => setMensagem(''), 2400);
    };

    const convidarTalento = (e, talento) => {
        e.stopPropagation();
        setConvidados(prev => new Set(prev).add(talento.id));
        setTalentoSelecionado(talento);
        mostrarMensagem(`${talento.nome} foi convidado para o processo.`);
    };

    const iniciarChat = (e, talento) => {
        e.stopPropagation();
        setTalentoSelecionado(talento);
        mostrarMensagem(`Conversa com ${talento.nome} iniciada.`);
    };

    const agendarEntrevista = (talento) => {
        setEntrevistas(prev => new Set(prev).add(talento.id));
        mostrarMensagem(`Entrevista com ${talento.nome} agendada.`);
    };

    if (carregando) return null;

    return (
        <div className="talentos-layout-wrapper">
            {mensagem && (
                <div className="talentos-toast">
                    <CheckCircle size={16} />
                    {mensagem}
                </div>
            )}

=======
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
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
            <aside className="talentos-sidebar">
                <div className="sidebar-header">
                    <Filter size={18} color="#a755f7" />
                    <span>Filtros Avançados</span>
                </div>

                <div className="filter-group">
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
                    <label>Buscar talentos</label>
=======
                    <label>Buscar Talentos</label>
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
                    <div className="search-wrapper">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Nome, skill ou formação..."
                            className="search-input"
                            value={busca}
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
                            onChange={(e) => setBusca(e.target.value)}
=======
                            onChange={(e) =>
                                setBusca(e.target.value)
                            }
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
                        />
                    </div>
                </div>

                <div className="filter-group">
                    <label>Senioridade</label>
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
                    {senioridades.map((nivel) => (
                        <div className="check-item" key={nivel}>
                            <input
                                type="checkbox"
                                id={`senioridade-${nivel}`}
                                checked={senioridadesSelecionadas.includes(nivel)}
                                onChange={() => toggleSenioridade(nivel)}
                            />
                            <label htmlFor={`senioridade-${nivel}`}>{nivel}</label>
                        </div>
                    ))}
                </div>

                <div className="filter-group">
                    <label>Pretensão salarial máxima</label>
                    <span className="salary-text">
                        R$ {salario.toLocaleString('pt-BR')}
                    </span>
=======
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
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
                    <input
                        type="range"
                        className="salary-slider"
                        min="2000"
                        max="20000"
                        step="500"
                        value={salario}
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
                        onChange={(e) => setSalario(Number(e.target.value))}
=======
                        onChange={(e) =>
                            setSalario(Number(e.target.value))
                        }
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
                    />
                    <div className="range-values">
                        <span>2k</span>
                        <span>20k+</span>
                    </div>
                </div>
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx

                <div className="filter-group">
                    <label>Ordenar por</label>
                    <select
                        className="talentos-select"
                        value={ordenacao}
                        onChange={(e) => setOrdenacao(e.target.value)}
                    >
                        <option value="match">Melhor match</option>
                        <option value="experiencia">Mais experiência</option>
                        <option value="salario">Menor salário</option>
                        <option value="nome">Nome</option>
                    </select>
                </div>

                <button className="btn-reset-filters" onClick={limparFiltros}>
                    Limpar tudo
=======
                <button className="btn-reset-filters" onClick={() => { setBusca(''); setSenioridadesSelecionadas([]); setSalario(8000); }}>
                    Limpar Tudo
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
                </button>
            </aside>

            <main className="talentos-page-container">
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
                <div className="talentos-summary-grid">
                    <div className="talentos-summary-card">
                        <Users size={18} />
                        <span>Talentos</span>
                        <strong>{resumo.total}</strong>
                    </div>
                    <div className="talentos-summary-card">
                        <Heart size={18} />
                        <span>Favoritos</span>
                        <strong>{resumo.favoritos}</strong>
                    </div>
                    <div className="talentos-summary-card">
                        <UserPlus size={18} />
                        <span>Convidados</span>
                        <strong>{resumo.convidados}</strong>
                    </div>
                    <div className="talentos-summary-card">
                        <Calendar size={18} />
                        <span>Entrevistas</span>
                        <strong>{resumo.entrevistas}</strong>
                    </div>
                </div>

                <header className="talentos-header-v2">
                    <div className="header-text">
                        <h2 className="talentos-title">Banco de Talentos Inteligente</h2>
=======
                <header className="talentos-header-v2">
                    <div className="header-text">
                        <h2 className="talentos-title">
                            Banco de Talentos Inteligente
                        </h2>
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
                        <p className="talentos-subtitle">
                            {talentos.length} talentos encontrados
                        </p>
                    </div>
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx

                    <div className="filter-chips">
                        {areas.map(area => (
                            <button
                                key={area}
                                className={`chip ${areaAtiva === area ? 'active' : ''}`}
                                onClick={() => setAreaAtiva(area)}
                            >
                                {area}
                            </button>
                        ))}
=======
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
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
                    </div>
                </header>

                <div className="talentos-grid">
                    {talentos.length > 0 ? (
                        talentos.map((talento) => (
                            <TalentoCard
                                key={talento.id}
                                talento={talento}
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
                                compatibilidade={calcularCompatibilidade(talento)}
                                isSelected={talentoSelecionado?.id === talento.id}
                                isFavorito={favoritos.has(talento.id)}
                                isConvidado={convidados.has(talento.id)}
                                isEntrevista={entrevistas.has(talento.id)}
                                onSelect={() => setTalentoSelecionado(talento)}
                                onToggleFavorito={toggleFavorito}
                                onConvidar={convidarTalento}
                                onChat={iniciarChat}
=======
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
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
                            />
                        ))
                    ) : (
                        <div className="empty-state">
                            <Sparkles size={40} />
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
                            <h3>Nenhum talento encontrado</h3>
                            <p>Tente ajustar os filtros ou realizar outra busca.</p>
=======
                            <h3>
                                Nenhum talento encontrado
                            </h3>
                            <p>
                                Tente ajustar os filtros
                                ou realizar outra busca.
                            </p>
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
                        </div>
                    )}
                </div>
            </main>

            {talentoSelecionado && (
                <ResumoAI
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
                    talento={normalizarTalento(talentoSelecionado)}
                    compatibilidade={calcularCompatibilidade(normalizarTalento(talentoSelecionado))}
                    analiseIA={analisarTalentoIA(normalizarTalento(talentoSelecionado))}
                    isFavorito={favoritos.has(talentoSelecionado.id)}
                    isConvidado={convidados.has(talentoSelecionado.id)}
                    isEntrevista={entrevistas.has(talentoSelecionado.id)}
                    onClose={() => setTalentoSelecionado(null)}
                    onAgendar={agendarEntrevista}
                    onConvidar={(t) => {
                        setConvidados(prev => new Set(prev).add(t.id));
                        mostrarMensagem(`${t.nome} foi convidado para o processo.`);
                    }}
=======
                    talento={talentoSelecionado}
                    compatibilidade={
                        calcularCompatibilidade(
                            talentoSelecionado
                        )
                    }
                    onClose={() =>
                        setTalentoSelecionado(null)
                    }
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
                />
            )}
        </div>
    );
};

const TalentoCard = ({
    talento,
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
    compatibilidade,
    isSelected,
    isFavorito,
    isConvidado,
    isEntrevista,
    onSelect,
    onToggleFavorito,
    onConvidar,
    onChat
}) => (
    <div
        className={`talento-card-v2 ${isSelected ? 'selected' : ''}`}
        onClick={onSelect}
    >
        <div className="match-badge-container">
            <Zap size={12} />
            {compatibilidade}% match
        </div>

        <button
            className={`fav-btn ${isFavorito ? 'active' : ''}`}
            onClick={(e) => onToggleFavorito(e, talento.id)}
            title={isFavorito ? 'Remover dos favoritos' : 'Favoritar talento'}
        >
            <Heart
                size={20}
                fill={isFavorito ? '#ef4444' : 'transparent'}
                stroke={isFavorito ? '#ef4444' : '#ccc'}
            />
        </button>
=======
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
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx

        <div className="card-top">
            <div className="avatar-wrapper">
                <div className="talento-avatar-v2">
                    {talento.nome?.charAt(0)}
                </div>
                <div className="status-indicator online"></div>
            </div>
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx

            <div className="main-meta">
                <h3>{talento.nome}</h3>
                <p>{talento.formacao}</p>

                <div className="talento-meta-row">
                    <span>{talento.senioridade}</span>
                    <span>{talento.area}</span>
                    <span>R$ {talento.pretensaoSalarial?.toLocaleString('pt-BR')}</span>
                </div>

                <div className="exp-label">
                    <Star size={14} className="star-icon" />
                    <span>{talento.experiencia} anos exp.</span>
                </div>
            </div>
        </div>

        <div className="talento-badges">
            <span className="badge-disponivel">{talento.disponibilidade}</span>
            {talento.certificacoes?.length > 0 && (
                <span className="badge-cert">Certificado</span>
            )}
            {isConvidado && <span className="badge-convidado">Convidado</span>}
            {isEntrevista && <span className="badge-entrevista">Entrevista</span>}
        </div>

        <div className="skills-section">
            <span className="section-label-tiny">Principais skills</span>
            <div className="skills-grid-v2">
                {talento.skills?.slice(0, 5).map((skill) => (
                    <span key={skill} className="skill-pill-v2">
                        {skill}
                    </span>
                ))}
=======
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
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
            </div>
        </div>

        <div className="card-footer-v2">
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
            <button className="btn-chat-secundario" onClick={(e) => onChat(e, talento)}>
                <MessageCircle size={18} />
                Chat
            </button>

            <button
                className={`btn-convidar-primario ${isConvidado ? 'done' : ''}`}
                onClick={(e) => onConvidar(e, talento)}
            >
                {isConvidado ? <CheckCircle size={18} /> : <UserPlus size={18} />}
                {isConvidado ? 'Convidado' : 'Convidar'}
=======
            <button className="btn-chat-secundario">
                <MessageCircle size={18} />
            </button>
            <button className="btn-convidar-primario">
                <UserPlus size={18} />
                Convidar
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
            </button>
        </div>
    </div>
);

const ResumoAI = ({
    talento,
    compatibilidade,
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
    analiseIA,
    isFavorito,
    isConvidado,
    isEntrevista,
    onClose,
    onAgendar,
    onConvidar
}) => (
    <aside className="resumo-ai-sidebar">
        <button className="btn-close-ai" onClick={onClose}>
=======
    onClose
}) => (

    <aside className="resumo-ai-sidebar">
        <button
            className="btn-close-ai"
            onClick={onClose}
        >
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
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
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
                <span className="match-percentage">{compatibilidade}%</span>
            </div>

            <div className="match-progress-bg">
                <div
                    className="match-progress-fill"
                    style={{ width: `${compatibilidade}%` }}
                />
            </div>
        </div>

        <div className="ai-profile-facts">
            <div>
                <span>Senioridade</span>
                <strong>{talento.senioridade}</strong>
            </div>
            <div>
                <span>Pretensão</span>
                <strong>R$ {talento.pretensaoSalarial?.toLocaleString('pt-BR')}</strong>
            </div>
            <div>
                <span>Status</span>
                <strong>{isEntrevista ? 'Entrevista' : isConvidado ? 'Convidado' : isFavorito ? 'Favorito' : 'Novo'}</strong>
=======
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
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
            </div>
        </div>

        <div className="ai-analysis-box">
            <div className="ai-tag">
                <Sparkles size={14} />
                Resumo Inteligente
            </div>
            <p>
<<<<<<< HEAD:Help/frontend/src/pages/Talentos.jsx
                {analiseIA?.resumo || ''} O candidato demonstra alinhamento para projetos de tecnologia, colaboração técnica e evolução de produto.
            </p>
        </div>

        <div className="ai-action-stack">
            <button
                className={`btn-sidebar-action ${isConvidado ? 'done' : ''}`}
                onClick={() => onConvidar(talento)}
            >
                {isConvidado ? <CheckCircle size={18} /> : <UserPlus size={18} />}
                {isConvidado ? 'Já convidado' : 'Convidar candidato'}
            </button>

            <button
                className={`btn-agendar-entrevista ${isEntrevista ? 'done' : ''}`}
                onClick={() => onAgendar(talento)}
            >
                {isEntrevista ? <CheckCircle size={18} /> : <Calendar size={18} />}
                {isEntrevista ? 'Entrevista agendada' : 'Agendar entrevista'}
            </button>
        </div>
=======
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
>>>>>>> 01f3cafd15c9ccd52211aaa6713347c51d2f61ac:src/pages/Talentos.jsx
    </aside>
);

export default Talentos;
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import api from '../services/api';

const areas = ['Todos', 'Devs', 'Designers', 'Favoritos'];

const normalizarTalento = (talento) => {
    const senioridade = talento.senioridade || 'Não informada';

    const area =
        talento.area ||
        (talento.skills?.some(skill => ['Figma', 'UI/UX', 'Adobe XD', 'Design'].includes(skill))
            ? 'Designers' : talento.skills?.length ? 'Devs' : 'Não informada');

    const pretensaoSalarial = talento.pretensaoSalarial ?? null;

    return {
        localizacao: 'Não informada',
        disponibilidade: 'Não informada',
        certificacoes: [],
        ...talento,
        senioridade,
        area,
        pretensaoSalarial
    };
};

const Talentos = () => {
    const navigate = useNavigate();
    const [talentosDB, setTalentosDB] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState('');

    const [favoritos, setFavoritos] = useState(() => {
        try {
            const salvos = JSON.parse(localStorage.getItem('favoritosTalentosRH') || '[]');
            return new Set(Array.isArray(salvos) ? salvos : []);
        } catch { return new Set(); }
    });

    const [talentoSelecionado, setTalentoSelecionado] = useState(null);
    const [busca, setBusca] = useState('');
    const [areaAtiva, setAreaAtiva] = useState('Todos');
    const [ordenacao, setOrdenacao] = useState('nome');

    useEffect(() => {
        const buscarDados = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {};
                if (token && token !== "null" && token !== "undefined") {
                    config.headers = { Authorization: `Bearer ${token}` };
                }
                const response = await api.get('/api/vagas/talentos', config);
                setTalentosDB(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                setErroCarregamento('Não foi possível carregar os talentos. Tente novamente.');
            } finally {
                setCarregando(false);
            }
        };
        buscarDados();
    }, []);

    useEffect(() => {
        try { localStorage.setItem('favoritosTalentosRH', JSON.stringify([...favoritos])); }
        catch { /* Os favoritos continuam disponíveis nesta aba. */ }
    }, [favoritos]);

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

                const bateArea = areaAtiva === 'Todos' || areaAtiva === 'Favoritos' || talento.area === areaAtiva;
                const bateFavorito = areaAtiva !== 'Favoritos' || favoritos.has(talento.id);

                return bateBusca && bateArea && bateFavorito;
            })
            .sort((a, b) => {
                if (ordenacao === 'nome') return a.nome ? a.nome.localeCompare(b.nome) : 0;
                return calcularCompatibilidade(b) - calcularCompatibilidade(a);
            });
    }, [talentosBase, busca, areaAtiva, favoritos, ordenacao]);

    const resumo = useMemo(() => ({
        total: talentosBase.length,
        favoritos: favoritos.size
    }), [talentosBase.length, favoritos.size]);

    const toggleFavorito = (e, id) => {
        e.stopPropagation();
        setFavoritos(prev => {
            const novoSet = new Set(prev);
            novoSet.has(id) ? novoSet.delete(id) : novoSet.add(id);
            return novoSet;
        });
    };

    const limparFiltros = () => {
        setBusca('');
        setAreaAtiva('Todos');
        setOrdenacao('nome');
    };

    const iniciarChat = (e, talento) => {
        e.stopPropagation();
        navigate('/mensagens', { state: { iniciarCom: { contaId: talento.id, tipoConta: 'USUARIO', nome: talento.nome, fotoUrl: talento.fotoUrl } } });
    };

    if (carregando) return <main className="talentos-page-container"><p>Carregando talentos...</p></main>;
    if (erroCarregamento) return <main className="talentos-page-container"><p role="alert">{erroCarregamento}</p><button type="button" onClick={() => window.location.reload()}>Tentar novamente</button></main>;

    return (
        <div className="talentos-layout-wrapper">
            <aside className="talentos-sidebar">
                <div className="sidebar-header">
                    <Filter size={18} color="#a755f7" />
                    <span>Filtros Avançados</span>
                </div>

                <div className="filter-group">
                    <label>Buscar talentos</label>
                    <div className="search-wrapper">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Nome, skill ou formação..."
                            className="search-input"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-group">
                    <label>Ordenar por</label>
                    <select
                        className="talentos-select"
                        value={ordenacao}
                        onChange={(e) => setOrdenacao(e.target.value)}
                    >
                        <option value="nome">Nome</option>
                    </select>
                </div>

                <button className="btn-reset-filters" onClick={limparFiltros}>
                    Limpar tudo
                </button>
            </aside>

            <main className="talentos-page-container">
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
                </div>

                <header className="talentos-header-v2">
                    <div className="header-text">
                        <h2 className="talentos-title">Banco de Talentos Inteligente</h2>
                        <p className="talentos-subtitle">
                            {talentos.length} talentos encontrados
                        </p>
                    </div>

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
                    </div>
                </header>

                <div className="talentos-grid">
                    {talentos.length > 0 ? (
                        talentos.map((talento) => (
                            <TalentoCard
                                key={talento.id}
                                talento={talento}
                                compatibilidade={calcularCompatibilidade(talento)}
                                isSelected={talentoSelecionado?.id === talento.id}
                                isFavorito={favoritos.has(talento.id)}
                                onSelect={() => setTalentoSelecionado(talento)}
                                onToggleFavorito={toggleFavorito}
                                onChat={iniciarChat}
                            />
                        ))
                    ) : (
                        <div className="empty-state">
                            <Sparkles size={40} />
                            <h3>Nenhum talento encontrado</h3>
                            <p>Tente ajustar os filtros ou realizar outra busca.</p>
                        </div>
                    )}
                </div>
            </main>

            {talentoSelecionado && (
                <ResumoAI
                    talento={normalizarTalento(talentoSelecionado)}
                    compatibilidade={calcularCompatibilidade(normalizarTalento(talentoSelecionado))}
                    analiseIA={analisarTalentoIA(normalizarTalento(talentoSelecionado))}
                    isFavorito={favoritos.has(talentoSelecionado.id)}
                    onClose={() => setTalentoSelecionado(null)}
                />
            )}
        </div>
    );
};

const TalentoCard = ({
    talento,
    compatibilidade,
    isSelected,
    isFavorito,
    onSelect,
    onToggleFavorito,
    onChat
}) => (
    <div
        className={`talento-card-v2 ${isSelected ? 'selected' : ''}`}
        onClick={onSelect}
    >
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

        <div className="card-top">
            <div className="avatar-wrapper">
                <div className="talento-avatar-v2">
                    {talento.nome?.charAt(0)}
                </div>
            </div>

            <div className="main-meta">
                <h3>{talento.nome}</h3>
                <p>{talento.cargo || talento.formacao || 'Perfil profissional'}</p>

                <div className="talento-meta-row">
                    <span>{talento.senioridade}</span>
                    <span>{talento.area}</span>
                    <span>{talento.pretensaoSalarial == null ? 'Pretensão não informada' : `R$ ${talento.pretensaoSalarial.toLocaleString('pt-BR')}`}</span>
                </div>

                <div className="exp-label">
                    <Star size={14} className="star-icon" />
                    <span>{talento.experiencia == null ? 'Experiência não informada' : `${talento.experiencia} anos exp.`}</span>
                </div>
            </div>
        </div>

        <div className="talento-badges">
            {talento.disponibilidade !== 'Não informada' && <span className="badge-disponivel">{talento.disponibilidade}</span>}
            {talento.certificacoes?.length > 0 && (
                <span className="badge-cert">Certificado</span>
            )}
        </div>

        <div className="skills-section">
            <span className="section-label-tiny">Principais skills</span>
            <div className="skills-grid-v2">
                {talento.skills?.slice(0, 5).map((skill) => (
                    <span key={skill} className="skill-pill-v2">
                        {skill}
                    </span>
                ))}
            </div>
        </div>

        <div className="card-footer-v2">
            <button className="btn-chat-secundario" onClick={(e) => onChat(e, talento)}>
                <MessageCircle size={18} />
                Chat
            </button>

        </div>
    </div>
);

const ResumoAI = ({
    talento,
    compatibilidade,
    analiseIA,
    isFavorito,
    onClose,
}) => (
    <aside className="resumo-ai-sidebar">
        <button className="btn-close-ai" onClick={onClose}>
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

        <div className="ai-profile-facts">
            <div><span>Localização</span><strong>{talento.localizacao || 'Não informada'}</strong></div>
            <div><span>Área de atuação</span><strong>{talento.cargo || 'Não informada'}</strong></div>
            <div><span>Habilidades</span><strong>{talento.skills?.join(', ') || 'Não informadas'}</strong></div>
        </div>
    </aside>
);

export default Talentos;

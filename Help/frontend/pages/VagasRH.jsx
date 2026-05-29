import React, { useMemo, useState } from 'react';
import {
    AlertCircle,
    Ban,
    Briefcase,
    CheckCircle,
    Clock,
    Copy,
    DollarSign,
    Edit3,
    FileText,
    Filter,
    Sparkles,
    MapPin,
    PauseCircle,
    PlayCircle,
    Plus,
    Share2,
    Users,
    X
} from 'lucide-react';
import './VagasRH.css';
import { analisarMatchGemini } from './matchIA';

const statusLabels = {
    ativa: 'Ativa',
    pausada: 'Pausada',
    encerrada: 'Encerrada'
};

const pipelineEtapas = ['Inscritos', 'Triagem', 'Entrevista', 'Proposta', 'Contratado'];

const normalizarVaga = (vaga) => ({
    modelo: 'Remoto',
    tipo: 'CLT',
    status: 'ativa',
    senioridade: 'Pleno',
    localizacao: 'Brasil',
    salario: 'A combinar',
    prioridade: 'media',
    descricao: 'Descricao da vaga ainda nao cadastrada.',
    skillsExigidas: [],
    experienciaMinima: 1,
    tipoExperiencia: 'anos',
    inscritos: [],
    ...vaga
});

const VagasRH = ({
    vagas,
    setVagas,
    talentos,
    busca,
    setShowModal,
    calcularMatch,
    analisarMatchIA,
    setAbaAtiva,
    setVagaSelecionada
}) => {
    const [filtroStatus, setFiltroStatus] = useState('todas');
    const [filtroModelo, setFiltroModelo] = useState('todos');
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [ordenacao, setOrdenacao] = useState('recentes');
    const [vagaDetalhe, setVagaDetalhe] = useState(null);
    const [abaDetalhe, setAbaDetalhe] = useState('resumo');
    const [vagaEditando, setVagaEditando] = useState(null);
    const [form, setForm] = useState({});
    const [tipoExperiencia, setTipoExperiencia] = useState('anos');
    const [analisesGemini, setAnalisesGemini] = useState({});
    const [iaCarregando, setIaCarregando] = useState(null);

    const vagasNormalizadas = useMemo(() => vagas.map(normalizarVaga), [vagas]);

    const melhorMatch = (vaga) => {
        const candidatos = talentos.filter(talento => vaga.inscritos.includes(talento.id));
        if (candidatos.length === 0) return 0;
        return Math.max(...candidatos.map(talento => calcularMatch(talento, vaga)));
    };

    const obterAnaliseIA = (talento, vaga) => {
        if (analisarMatchIA) return analisarMatchIA(talento, vaga);
        const score = calcularMatch(talento, vaga);
        return {
            score,
            cor: score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444',
            recomendacao: score >= 75 ? 'Bom candidato' : 'Precisa de triagem',
            resumo: `${score}% de aderencia para a vaga.`,
            pontosFortes: [],
            pontosAtencao: []
        };
    };

    const candidatosDaVaga = (vaga) => {
        return talentos
            .filter(talento => vaga.inscritos.includes(talento.id))
            .sort((a, b) => calcularMatch(b, vaga) - calcularMatch(a, vaga));
    };

    const resumo = useMemo(() => {
        const ativas = vagasNormalizadas.filter(v => v.status === 'ativa').length;
        const pausadas = vagasNormalizadas.filter(v => v.status === 'pausada').length;
        const encerradas = vagasNormalizadas.filter(v => v.status === 'encerrada').length;
        const candidatos = vagasNormalizadas.reduce((acc, v) => acc + v.inscritos.length, 0);
        const entrevistas = vagasNormalizadas.reduce((acc, v) => acc + Math.ceil(v.inscritos.length / 3), 0);
        return { ativas, pausadas, encerradas, candidatos, entrevistas };
    }, [vagasNormalizadas]);

    const vagasFiltradas = useMemo(() => {
        const termoBusca = busca.toLowerCase();
        return vagasNormalizadas
            .filter(vaga => {
                const bateBusca =
                    vaga.cargo.toLowerCase().includes(termoBusca) ||
                    vaga.skillsExigidas.join(' ').toLowerCase().includes(termoBusca) ||
                    vaga.modelo.toLowerCase().includes(termoBusca) ||
                    vaga.tipo.toLowerCase().includes(termoBusca) ||
                    vaga.senioridade.toLowerCase().includes(termoBusca) ||
                    vaga.localizacao.toLowerCase().includes(termoBusca);
                const bateStatus = filtroStatus === 'todas' || vaga.status === filtroStatus;
                const bateModelo = filtroModelo === 'todos' || vaga.modelo === filtroModelo;
                const bateTipo = filtroTipo === 'todos' || vaga.tipo === filtroTipo;
                return bateBusca && bateStatus && bateModelo && bateTipo;
            })
            .sort((a, b) => {
                if (ordenacao === 'candidatos') return b.inscritos.length - a.inscritos.length;
                if (ordenacao === 'match') return melhorMatch(b) - melhorMatch(a);
                return b.id - a.id;
            });
    }, [vagasNormalizadas, busca, filtroStatus, filtroModelo, filtroTipo, ordenacao]);

    const atualizarVaga = (id, dados) => {
        setVagas(prev => prev.map(v => v.id === id ? { ...v, ...dados } : v));
        setVagaDetalhe(prev => prev?.id === id ? normalizarVaga({ ...prev, ...dados }) : prev);
    };

    const abrirEdicao = (vaga) => {
        setVagaEditando(vaga);
        const tipoSalvo = vaga.tipoExperiencia || (vaga.experienciaMinima === 0 ? 'nenhuma' : 'anos');
        setTipoExperiencia(tipoSalvo);
        setForm({
            cargo: vaga.cargo,
            skills: vaga.skillsExigidas.join(', '),
            experienciaMinima: vaga.experienciaMinima,
            modelo: vaga.modelo,
            tipo: vaga.tipo,
            senioridade: vaga.senioridade,
            localizacao: vaga.localizacao,
            salario: vaga.salario,
            prioridade: vaga.prioridade,
            descricao: vaga.descricao
        });
    };

    const salvarEdicao = () => {
        if (!form.cargo?.trim()) return;
        const valorExperiencia = tipoExperiencia === 'nenhuma' ? 0 : Number(form.experienciaMinima) || 0;
        atualizarVaga(vagaEditando.id, {
            cargo: form.cargo,
            skillsExigidas: form.skills.split(',').map(s => s.trim()).filter(Boolean),
            experienciaMinima: valorExperiencia,
            tipoExperiencia,
            modelo: form.modelo,
            tipo: form.tipo,
            senioridade: form.senioridade,
            localizacao: form.localizacao,
            salario: form.salario,
            prioridade: form.prioridade,
            descricao: form.descricao
        });
        setVagaEditando(null);
    };

    const duplicarVaga = (vaga) => {
        const novaVaga = { ...vaga, id: Date.now(), cargo: `${vaga.cargo} - Copia`, data: 'Hoje', inscritos: [], status: 'ativa' };
        setVagas(prev => [novaVaga, ...prev]);
    };

    const excluirVaga = (id) => {
        if (window.confirm('Deseja realmente excluir esta vaga?')) {
            setVagas(prev => prev.filter(v => v.id !== id));
            setVagaDetalhe(null);
            setVagaEditando(null);
        }
    };

    const compartilharVaga = async (vaga) => {
        const texto = `${vaga.cargo} | ${vaga.modelo} | ${vaga.tipo} | ${vaga.salario}`;
        try {
            await navigator.clipboard.writeText(texto);
            alert('Resumo da vaga copiado.');
        } catch {
            alert(texto);
        }
    };

    const abrirCandidatosNoPainel = (vagaId) => {
        setAbaAtiva('painel');
        setVagaSelecionada(vagaId);
    };

    const analisarCandidatoComGemini = async (candidato, vaga) => {
        const chave = `${vaga.id}-${candidato.id}`;
        setIaCarregando(chave);
        const analise = await analisarMatchGemini(candidato, vaga);
        setAnalisesGemini(prev => ({ ...prev, [chave]: analise }));
        setIaCarregando(null);
    };

    // Estilo dos botões de tipo de experiência (reutilizado nos dois modais)
    const expBtnStyle = (tipo, ativo) => ({
        flex: 1,
        padding: '10px',
        borderRadius: '8px',
        border: ativo === tipo ? '2px solid #a755f7' : '1px solid #3f3f46',
        background: ativo === tipo ? 'rgba(167, 85, 247, 0.1)' : 'transparent',
        color: ativo === tipo ? '#c084fc' : '#a1a1aa',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        transition: 'all 0.2s'
    });

    return (
        <section className="vagas-rh-page">
            {/* Resumo */}
            <div className="vagas-summary-grid">
                <div className="post vagas-summary-card"><Briefcase size={20} /><span>Vagas ativas</span><strong>{resumo.ativas}</strong></div>
                <div className="post vagas-summary-card"><Users size={20} /><span>Candidatos</span><strong>{resumo.candidatos}</strong></div>
                <div className="post vagas-summary-card"><Clock size={20} /><span>Entrevistas</span><strong>{resumo.entrevistas}</strong></div>
                <div className="post vagas-summary-card"><CheckCircle size={20} /><span>Encerradas</span><strong>{resumo.encerradas}</strong></div>
            </div>

            {/* Header */}
            <div className="create-post-container vagas-rh-header">
                <div>
                    <h3>Gerenciar Vagas</h3>
                    <p>Acompanhe status, requisitos, matches, pipeline e detalhes das oportunidades.</p>
                </div>
                <button className="btn-primary-rh" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Nova Vaga
                </button>
            </div>

            {/* Filtros */}
            <div className="post vagas-rh-filters">
                <div className="vagas-rh-filter-title"><Filter size={16} /><span>Filtros</span></div>
                <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
                    <option value="todas">Todos os status</option>
                    <option value="ativa">Ativas</option>
                    <option value="pausada">Pausadas</option>
                    <option value="encerrada">Encerradas</option>
                </select>
                <select value={filtroModelo} onChange={e => setFiltroModelo(e.target.value)}>
                    <option value="todos">Todos os modelos</option>
                    <option value="Remoto">Remoto</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Presencial">Presencial</option>
                </select>
                <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                    <option value="todos">Todos os contratos</option>
                    <option value="CLT">CLT</option>
                    <option value="PJ">PJ</option>
                    <option value="Estágio">Estágio</option>
                    <option value="Freelancer">Freelancer</option>
                </select>
                <select value={ordenacao} onChange={e => setOrdenacao(e.target.value)}>
                    <option value="recentes">Mais recentes</option>
                    <option value="candidatos">Mais candidatos</option>
                    <option value="match">Melhor match</option>
                </select>
            </div>

            {vagasFiltradas.length === 0 && (
                <div className="post vagas-rh-empty">
                    <Briefcase size={34} color="#a755f7" />
                    <h4>Nenhuma vaga encontrada</h4>
                    <p>Tente ajustar os filtros ou criar uma nova vaga.</p>
                </div>
            )}

            {/* Cards de vagas */}
            {vagasFiltradas.map(vaga => {
                const match = melhorMatch(vaga);

                return (
                    <div className="post vagas-rh-card" key={vaga.id}>
                        <div className="vagas-rh-card-header">
                            <div>
                                <div className="vagas-rh-title-row">
                                    <h4>{vaga.cargo}</h4>
                                    <span className={`vaga-status ${vaga.status}`}>{statusLabels[vaga.status]}</span>
                                    <span className={`prioridade prioridade-${vaga.prioridade}`}>{vaga.prioridade}</span>
                                </div>
                                <p>Publicada em {vaga.data} | {vaga.senioridade}</p>
                            </div>
                            <button className="btn-icon-more-clean" title="Editar vaga" onClick={() => abrirEdicao(vaga)}>
                                <Edit3 size={18} />
                            </button>
                        </div>

                        <div className="vagas-rh-metrics">
                            <div><p>Inscritos</p><strong>{vaga.inscritos.length}</strong></div>
                            <div>
                                <p>Melhor match</p>
                                <strong className={match >= 75 ? 'match-good' : 'match-medium'}>{match}%</strong>
                            </div>
                            <div>
                                <p>Experiência</p>
                                <strong>
                                    {vaga.tipoExperiencia === 'nenhuma' || vaga.experienciaMinima === 0
                                        ? 'Nenhuma'
                                        : `${vaga.experienciaMinima}+ ${vaga.tipoExperiencia || 'anos'}`}
                                </strong>
                            </div>
                            <div><p>Contrato</p><strong>{vaga.tipo}</strong></div>
                        </div>

                        <div className="vagas-rh-meta">
                            <span><MapPin size={14} /> {vaga.localizacao}</span>
                            <span><Clock size={14} /> {vaga.modelo}</span>
                            <span><DollarSign size={14} /> {vaga.salario}</span>
                        </div>

                        <div className="pipeline-mini">
                            {pipelineEtapas.map((etapa, index) => (
                                <div key={etapa}>
                                    <span>{etapa}</span>
                                    <strong>{Math.max(vaga.inscritos.length - index, 0)}</strong>
                                </div>
                            ))}
                        </div>

                        <div className="vagas-rh-skills">
                            {vaga.skillsExigidas.length > 0
                                ? vaga.skillsExigidas.map((skill, i) => <span key={i}>{skill}</span>)
                                : <small>Nenhuma skill cadastrada.</small>}
                        </div>

                        <div className="post-actions rh-actions vagas-rh-main-actions">
                            <button onClick={() => setVagaDetalhe(vaga)}><FileText size={18} /> Detalhes</button>
                            <button onClick={() => abrirCandidatosNoPainel(vaga.id)}><Users size={18} /> Candidatos</button>
                            {vaga.status === 'ativa' && <button onClick={() => atualizarVaga(vaga.id, { status: 'pausada' })}><PauseCircle size={18} /> Pausar</button>}
                            {vaga.status === 'pausada' && <button onClick={() => atualizarVaga(vaga.id, { status: 'ativa' })}><PlayCircle size={18} /> Reabrir</button>}
                            {vaga.status !== 'encerrada' && <button onClick={() => atualizarVaga(vaga.id, { status: 'encerrada' })}><CheckCircle size={18} /> Encerrar</button>}
                        </div>

                        <div className="vagas-rh-quick-actions">
                            <button onClick={() => duplicarVaga(vaga)}><Copy size={14} /> Duplicar</button>
                            <button onClick={() => compartilharVaga(vaga)}><Share2 size={14} /> Compartilhar</button>
                            <button className="danger" onClick={() => excluirVaga(vaga.id)}><Ban size={14} /> Excluir</button>
                        </div>
                    </div>
                );
            })}

            {/* Modal: Detalhe da vaga */}
            {vagaDetalhe && (
                <div className="modal-overlay">
                    <div className="vaga-modal">
                        <div className="vaga-modal-header">
                            <div>
                                <h3>{vagaDetalhe.cargo}</h3>
                                <p>{vagaDetalhe.modelo} | {vagaDetalhe.tipo} | {vagaDetalhe.salario}</p>
                            </div>
                            <button onClick={() => setVagaDetalhe(null)}><X size={20} /></button>
                        </div>

                        <div className="vaga-modal-tabs">
                            {['resumo', 'candidatos', 'pipeline', 'configuracoes'].map(aba => (
                                <button key={aba} className={abaDetalhe === aba ? 'active' : ''} onClick={() => setAbaDetalhe(aba)}>{aba}</button>
                            ))}
                        </div>

                        <div className="vaga-modal-body">
                            {abaDetalhe === 'resumo' && (
                                <>
                                    <h4>Descrição</h4>
                                    <p>{vagaDetalhe.descricao}</p>
                                    <h4>Requisitos</h4>
                                    <div className="vagas-rh-skills">
                                        {vagaDetalhe.skillsExigidas.map((skill, i) => <span key={i}>{skill}</span>)}
                                    </div>
                                </>
                            )}

                            {abaDetalhe === 'candidatos' && (
                                <div className="modal-candidates-list">
                                    {candidatosDaVaga(vagaDetalhe).map(candidato => {
                                        const chave = `${vagaDetalhe.id}-${candidato.id}`;
                                        const analise = analisesGemini[chave] || obterAnaliseIA(candidato, vagaDetalhe);
                                        const carregando = iaCarregando === chave;
                                        return (
                                            <div key={candidato.id} className="modal-candidate-ia">
                                                <div>
                                                    <strong>{candidato.nome}</strong>
                                                    <span>{candidato.formacao}</span>
                                                </div>
                                                <b style={{ color: analise.cor }}>{analise.score}%</b>
                                                <small>{analise.recomendacao}</small>
                                                <p>{analise.resumo}</p>
                                                {analise.pontosFortes?.length > 0 && (
                                                    <ul>{analise.pontosFortes.slice(0, 2).map(p => <li key={p}>{p}</li>)}</ul>
                                                )}
                                                {analise.perguntasEntrevista?.length > 0 && (
                                                    <div className="ia-questions">
                                                        <strong>Perguntas sugeridas</strong>
                                                        {analise.perguntasEntrevista.slice(0, 2).map(p => <span key={p}>{p}</span>)}
                                                    </div>
                                                )}
                                                {analise.aviso && <em>{analise.aviso}</em>}
                                                <button className="btn-gemini-analysis" onClick={() => analisarCandidatoComGemini(candidato, vagaDetalhe)} disabled={carregando}>
                                                    <Sparkles size={14} />
                                                    {carregando ? 'Analisando...' : analise.origem === 'gemini' ? 'Reanalisar com Gemini' : 'Analisar com Gemini'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                    {candidatosDaVaga(vagaDetalhe).length === 0 && <p>Nenhum candidato inscrito ainda.</p>}
                                </div>
                            )}

                            {abaDetalhe === 'pipeline' && (
                                <div className="pipeline-large">
                                    {pipelineEtapas.map((etapa, index) => (
                                        <div key={etapa}>
                                            <span>{etapa}</span>
                                            <strong>{Math.max(vagaDetalhe.inscritos.length - index, 0)}</strong>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {abaDetalhe === 'configuracoes' && (
                                <div className="config-actions">
                                    <button onClick={() => abrirEdicao(vagaDetalhe)}><Edit3 size={16} /> Editar vaga</button>
                                    <button onClick={() => duplicarVaga(vagaDetalhe)}><Copy size={16} /> Duplicar vaga</button>
                                    <button className="danger" onClick={() => excluirVaga(vagaDetalhe.id)}><AlertCircle size={16} /> Excluir vaga</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Editar vaga */}
            {vagaEditando && (
                <div className="modal-overlay">
                    <div className="vaga-modal">
                        <div className="vaga-modal-header">
                            <h3>Editar Vaga</h3>
                            <button onClick={() => setVagaEditando(null)}><X size={20} /></button>
                        </div>

                        <div className="vaga-edit-grid">
                            <input value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} placeholder="Cargo" />
                            <input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="Skills separadas por vírgula" />

                            {/* Botões de tipo de experiência */}
                            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>Experiência mínima</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {['anos', 'meses', 'nenhuma'].map(tipo => (
                                        <button
                                            key={tipo}
                                            type="button"
                                            onClick={() => setTipoExperiencia(tipo)}
                                            style={expBtnStyle(tipo, tipoExperiencia)}
                                        >
                                            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                {tipoExperiencia !== 'nenhuma' ? (
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.experienciaMinima || ''}
                                        onChange={e => setForm({ ...form, experienciaMinima: e.target.value })}
                                        placeholder={`Quantidade de ${tipoExperiencia}`}
                                    />
                                ) : (
                                    <div style={{ padding: '12px', background: '#1c1917', borderRadius: '8px', border: '1px solid #292524', color: '#78716c', fontSize: '14px' }}>
                                        Sem exigência de experiência
                                    </div>
                                )}
                            </div>

                            <input value={form.senioridade} onChange={e => setForm({ ...form, senioridade: e.target.value })} placeholder="Senioridade" />
                            <input value={form.localizacao} onChange={e => setForm({ ...form, localizacao: e.target.value })} placeholder="Localizacao" />
                            <input value={form.salario} onChange={e => setForm({ ...form, salario: e.target.value })} placeholder="Salario" />

                            <select value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })}>
                                <option>Remoto</option>
                                <option>Híbrido</option>
                                <option>Presencial</option>
                            </select>
                            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                                <option>CLT</option>
                                <option>PJ</option>
                                <option>Estágio</option>
                                <option>Freelancer</option>
                            </select>
                            <select value={form.prioridade} onChange={e => setForm({ ...form, prioridade: e.target.value })}>
                                <option value="alta">alta</option>
                                <option value="media">media</option>
                                <option value="baixa">baixa</option>
                            </select>

                            <textarea
                                style={{ gridColumn: '1 / -1' }}
                                value={form.descricao}
                                onChange={e => setForm({ ...form, descricao: e.target.value })}
                                placeholder="Descricao da vaga"
                            />
                        </div>

                        <button className="modal-save-btn" onClick={salvarEdicao}>
                            Salvar alterações
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default VagasRH;
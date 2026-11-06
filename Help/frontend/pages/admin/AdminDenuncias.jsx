import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2, ChevronDown, Eye, XCircle } from 'lucide-react';
import { Aviso } from './adminComponentes';
import { listarDenuncias, mensagemDeErro, moderarDenuncia } from '../../services/adminService';

const rotuloPrioridade = { CRITICA: 'Crítica', ALTA: 'Alta', MEDIA: 'Média', BAIXA: 'Baixa' };
const rotuloFiltro = { ABERTAS: 'Abertas', PENDENTE: 'Pendentes', EM_ANALISE: 'Em análise', RESOLVIDA: 'Resolvidas', TODAS: 'Todas' };

function AdminDenuncias() {
  const [denuncias, setDenuncias] = useState([]);
  const [filtro, setFiltro] = useState('ABERTAS');
  const [prioridade, setPrioridade] = useState('');
  const [selecionada, setSelecionada] = useState(null);
  const [decisao, setDecisao] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [aviso, setAviso] = useState(null);
  const fecharRef = useRef(null);
  const filtroRef = useRef(null);
  const [menuFiltroAberto, setMenuFiltroAberto] = useState(false);

  useEffect(() => {
    listarDenuncias().then(setDenuncias)
      .catch((erro) => setAviso({ tipo: 'erro', texto: mensagemDeErro(erro, 'Não foi possível carregar as denúncias.') }));
  }, []);

  useEffect(() => {
    if (!selecionada) return undefined;
    const fecharComEsc = (event) => { if (event.key === 'Escape') setSelecionada(null); };
    window.addEventListener('keydown', fecharComEsc);
    fecharRef.current?.focus();
    return () => window.removeEventListener('keydown', fecharComEsc);
  }, [selecionada]);

  useEffect(() => {
    const fecharAoClicarFora = (event) => {
      if (filtroRef.current && !filtroRef.current.contains(event.target)) setMenuFiltroAberto(false);
    };
    document.addEventListener('mousedown', fecharAoClicarFora);
    return () => document.removeEventListener('mousedown', fecharAoClicarFora);
  }, []);

  const visiveis = useMemo(() => denuncias.filter((denuncia) =>
    (filtro === 'TODAS' || (filtro === 'ABERTAS' ? denuncia.status !== 'RESOLVIDA' : denuncia.status === filtro))
    && (!prioridade || denuncia.prioridade === prioridade)
  ), [denuncias, filtro, prioridade]);
  const pendentes = denuncias.filter((denuncia) => denuncia.status === 'PENDENTE').length;
  const emAnalise = denuncias.filter((denuncia) => denuncia.status === 'EM_ANALISE').length;
  const criticas = denuncias.filter((denuncia) => denuncia.prioridade === 'CRITICA' && denuncia.status !== 'RESOLVIDA').length;

  const abrir = (denuncia) => {
    setSelecionada(denuncia);
    setDecisao('');
    setJustificativa('');
    setAviso(null);
  };

  const registrarDecisao = async () => {
    if (!decisao || !justificativa.trim()) {
      setAviso({ tipo: 'erro', texto: 'Escolha uma decisão e informe uma justificativa para registrar a análise.' });
      return;
    }
    try {
      const atualizada = await moderarDenuncia(selecionada.id, { status: 'RESOLVIDA', decisao, justificativa: justificativa.trim() });
      setDenuncias((atuais) => atuais.map((denuncia) => denuncia.id === atualizada.id ? atualizada : denuncia));
      setSelecionada(null);
      setAviso({ tipo: 'sucesso', texto: 'Decisão registrada como resolvida.' });
    } catch (erro) {
      setAviso({ tipo: 'erro', texto: mensagemDeErro(erro, 'Não foi possível registrar a decisão.') });
    }
  };

  return (
    <section>
      <div className="adm-titulo-pagina">
        <h1>Denúncias</h1>
      </div>
      <p className="adm-orientacao-pagina">Toda decisão deve conter uma justificativa para manter o histórico de moderação.</p>
      <Aviso tipo={aviso?.tipo}>{aviso?.texto}</Aviso>
      <div className="adm-contadores-operacao" aria-label="Resumo das denúncias">
        <button type="button" className={filtro === 'PENDENTE' && !prioridade ? 'adm-contador-ativo' : ''} onClick={() => { setFiltro('PENDENTE'); setPrioridade(''); }} aria-pressed={filtro === 'PENDENTE' && !prioridade}><strong>{pendentes}</strong> pendente(s)</button>
        <button type="button" className={`adm-contador-atencao ${filtro === 'EM_ANALISE' && !prioridade ? 'adm-contador-ativo' : ''}`} onClick={() => { setFiltro('EM_ANALISE'); setPrioridade(''); }} aria-pressed={filtro === 'EM_ANALISE' && !prioridade}><strong>{emAnalise}</strong> em análise</button>
        <button type="button" className={`${criticas ? 'adm-contador-critico' : ''} ${prioridade === 'CRITICA' ? 'adm-contador-ativo' : ''}`} onClick={() => { setFiltro('ABERTAS'); setPrioridade('CRITICA'); }} aria-pressed={prioridade === 'CRITICA'}><strong>{criticas}</strong> crítica(s)</button>
      </div>

      <div className="adm-filtros">
        <div className="adm-filtro-denuncias" ref={filtroRef}>
          <button type="button" className="adm-filtro-denuncias-gatilho" onClick={() => setMenuFiltroAberto((aberto) => !aberto)} aria-haspopup="listbox" aria-expanded={menuFiltroAberto}>
            <span>Exibir: <strong>{rotuloFiltro[filtro]}</strong></span><ChevronDown size={17} aria-hidden="true" />
          </button>
          {menuFiltroAberto && <div className="adm-filtro-denuncias-opcoes" role="listbox" aria-label="Filtrar denúncias">
            {Object.entries(rotuloFiltro).map(([valor, rotulo]) => <button type="button" key={valor} role="option" aria-selected={filtro === valor} onClick={() => { setFiltro(valor); setPrioridade(''); setMenuFiltroAberto(false); }}><span>{rotulo}</span>{filtro === valor && <Check size={16} aria-hidden="true" />}</button>)}
          </div>}
        </div>
      </div>

      <div className="adm-tabela-wrapper">
        <table className="adm-tabela">
          <thead><tr><th>Prioridade</th><th>Denúncia</th><th>Motivo</th><th>Recebida</th><th>Status</th><th>Ação</th></tr></thead>
          <tbody>{visiveis.length === 0 ? <tr><td colSpan="6" className="adm-vazio">Nenhuma denúncia para este filtro.</td></tr> : visiveis.map((denuncia) => <tr key={denuncia.id}>
            <td data-label="Prioridade"><span className={`adm-prioridade adm-prioridade-${denuncia.prioridade.toLowerCase()}`}>{rotuloPrioridade[denuncia.prioridade]}</span></td>
            <td data-label="Denúncia"><strong>{String(denuncia.id).slice(0, 8)}</strong><br /><span className="adm-texto-suave">{denuncia.alvoNome}</span></td>
            <td data-label="Motivo">{denuncia.motivo}</td><td data-label="Recebida">{new Date(denuncia.criadaEm).toLocaleString('pt-BR')}</td><td data-label="Status"><span className="adm-badge adm-badge-tipo">{denuncia.status.replace('_', ' ')}</span></td>
            <td data-label="Ação"><button className="adm-botao adm-botao-secundario" onClick={() => abrir(denuncia)}><Eye size={15} /> Analisar</button></td>
          </tr>)}</tbody>
        </table>
      </div>

      {selecionada && <div className="adm-modal-overlay" role="presentation">
        <section className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-denuncia">
          <div className="adm-modal-topo"><div><span className={`adm-prioridade adm-prioridade-${selecionada.prioridade.toLowerCase()}`}>{rotuloPrioridade[selecionada.prioridade]}</span><h2 id="titulo-denuncia">{selecionada.motivo}</h2></div><button ref={fecharRef} className="adm-botao adm-botao-secundario" onClick={() => setSelecionada(null)}>Fechar</button></div>
          <div className="adm-paineis"><div className="adm-painel"><h2>Alvo e relato</h2><p><strong>{selecionada.alvoNome}</strong></p><p className="adm-texto-suave">{selecionada.descricao || 'Sem detalhes adicionais.'}</p></div><div className="adm-painel"><h2>Denunciante</h2><p className="adm-texto-suave">{selecionada.denuncianteNome}</p><p className="adm-texto-suave">Os dados são exibidos apenas para moderação.</p></div></div>
          <label className="adm-label">Decisão <span className="adm-obrigatorio">obrigatória</span><select value={decisao} onChange={(event) => setDecisao(event.target.value)}><option value="">Selecione</option><option value="SEM_ACAO">Sem ação</option><option value="ADVERTIR">Advertir</option><option value="REMOVER_CONTEUDO">Remover conteúdo</option><option value="SUSPENDER_CONTA">Suspender conta</option></select></label>
          <label className="adm-label">Justificativa <span className="adm-obrigatorio">obrigatória</span><textarea value={justificativa} onChange={(event) => setJustificativa(event.target.value)} maxLength="1000" placeholder="Explique a decisão para auditoria futura." /></label>
          <div className="adm-acoes"><button className="adm-botao adm-botao-secundario" onClick={() => setSelecionada(null)}><XCircle size={15} /> Cancelar</button><button className="adm-botao adm-botao-primario" onClick={registrarDecisao} disabled={!decisao || !justificativa.trim()}><CheckCircle2 size={15} /> Registrar decisão</button></div>
        </section>
      </div>}
    </section>
  );
}

export default AdminDenuncias;

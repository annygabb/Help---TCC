import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2, ChevronDown, Eye, XCircle } from 'lucide-react';
import { Aviso } from './adminComponentes';

const DENUNCIAS_INICIAIS = [
  { id: 'DEN-1042', alvo: 'Publicação de Marina Alves', tipo: 'Conteúdo impróprio', prioridade: 'ALTA', criadaEm: 'Hoje, 10:42', evidencia: 'Captura anexada pela pessoa denunciante.', acesso: 'Publicação pública', status: 'PENDENTE' },
  { id: 'DEN-1041', alvo: 'Perfil da empresa Nova Trilha', tipo: 'Informação enganosa', prioridade: 'MEDIA', criadaEm: 'Hoje, 09:18', evidencia: 'Link informado na denúncia.', acesso: 'Perfil público', status: 'PENDENTE' },
  { id: 'DEN-1039', alvo: 'Comentário em publicação', tipo: 'Assédio', prioridade: 'CRITICA', criadaEm: 'Ontem, 18:07', evidencia: 'Trecho protegido: disponível somente para análise desta denúncia.', acesso: 'Motivo de acesso: denúncia registrada', status: 'EM_ANALISE' }
];

const rotuloPrioridade = { CRITICA: 'Crítica', ALTA: 'Alta', MEDIA: 'Média', BAIXA: 'Baixa' };
const rotuloFiltro = { ABERTAS: 'Abertas', PENDENTE: 'Pendentes', EM_ANALISE: 'Em análise', RESOLVIDA: 'Resolvidas', TODAS: 'Todas' };

function AdminDenuncias() {
  const [denuncias, setDenuncias] = useState(DENUNCIAS_INICIAIS);
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

  const registrarDecisao = () => {
    if (!decisao || !justificativa.trim()) {
      setAviso({ tipo: 'erro', texto: 'Escolha uma decisão e informe uma justificativa para registrar a análise.' });
      return;
    }
    setDenuncias((atuais) => atuais.map((denuncia) => denuncia.id === selecionada.id
      ? { ...denuncia, status: 'RESOLVIDA', decisao, justificativa: justificativa.trim() }
      : denuncia));
    setSelecionada(null);
    setAviso({ tipo: 'sucesso', texto: `Decisão de ${selecionada.id} registrada como resolvida.` });
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
            <td data-label="Denúncia"><strong>{denuncia.id}</strong><br /><span className="adm-texto-suave">{denuncia.alvo}</span></td>
            <td data-label="Motivo">{denuncia.tipo}</td><td data-label="Recebida">{denuncia.criadaEm}</td><td data-label="Status"><span className="adm-badge adm-badge-tipo">{denuncia.status.replace('_', ' ')}</span></td>
            <td data-label="Ação"><button className="adm-botao adm-botao-secundario" onClick={() => abrir(denuncia)}><Eye size={15} /> Analisar</button></td>
          </tr>)}</tbody>
        </table>
      </div>

      {selecionada && <div className="adm-modal-overlay" role="presentation">
        <section className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-denuncia">
          <div className="adm-modal-topo"><div><span className={`adm-prioridade adm-prioridade-${selecionada.prioridade.toLowerCase()}`}>{rotuloPrioridade[selecionada.prioridade]}</span><h2 id="titulo-denuncia">{selecionada.id}: {selecionada.tipo}</h2></div><button ref={fecharRef} className="adm-botao adm-botao-secundario" onClick={() => setSelecionada(null)}>Fechar</button></div>
          <div className="adm-paineis"><div className="adm-painel"><h2>Alvo e evidência</h2><p><strong>{selecionada.alvo}</strong></p><p className="adm-texto-suave">{selecionada.evidencia}</p></div><div className="adm-painel"><h2>Limite de privacidade</h2><p className="adm-texto-suave">{selecionada.acesso}</p><p className="adm-texto-suave">Conversas privadas não são exibidas integralmente nesta tela.</p></div></div>
          <label className="adm-label">Decisão <span className="adm-obrigatorio">obrigatória</span><select value={decisao} onChange={(event) => setDecisao(event.target.value)}><option value="">Selecione</option><option value="SEM_ACAO">Sem ação</option><option value="ADVERTIR">Advertir</option><option value="REMOVER_CONTEUDO">Remover conteúdo</option><option value="SUSPENDER_CONTA">Suspender conta</option></select></label>
          <label className="adm-label">Justificativa <span className="adm-obrigatorio">obrigatória</span><textarea value={justificativa} onChange={(event) => setJustificativa(event.target.value)} maxLength="1000" placeholder="Explique a decisão para auditoria futura." /></label>
          <div className="adm-acoes"><button className="adm-botao adm-botao-secundario" onClick={() => setSelecionada(null)}><XCircle size={15} /> Cancelar</button><button className="adm-botao adm-botao-primario" onClick={registrarDecisao} disabled={!decisao || !justificativa.trim()}><CheckCircle2 size={15} /> Registrar decisão</button></div>
        </section>
      </div>}
    </section>
  );
}

export default AdminDenuncias;

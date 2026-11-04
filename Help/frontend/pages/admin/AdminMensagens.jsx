import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2, ChevronDown, Send } from 'lucide-react';
import { Aviso } from './adminComponentes';

const CHAMADOS_INICIAIS = [
  { id: 'SUP-218', conta: 'Camila Rocha', tipoConta: 'Usuário', assunto: 'Dúvida sobre certificado', mensagem: 'Não localizei o certificado do curso concluído.', atualizacao: 'Hoje, 11:24', status: 'ABERTO' },
  { id: 'SUP-217', conta: 'Horizonte Sistemas', tipoConta: 'Empresa', assunto: 'Acesso a vagas', mensagem: 'Precisamos revisar uma vaga que não aparece para candidatos.', atualizacao: 'Hoje, 09:06', status: 'EM_ANDAMENTO' },
  { id: 'SUP-213', conta: 'Diego Nunes', tipoConta: 'Usuário', assunto: 'Atualização cadastral', mensagem: 'Solicito orientação para atualizar meus dados públicos.', atualizacao: 'Ontem, 16:40', status: 'RESOLVIDO' }
];
const ROTULOS_FILTRO = { ABERTOS: 'Abertos', ABERTO: 'Novos', EM_ANDAMENTO: 'Em andamento', RESOLVIDO: 'Resolvidos', TODOS: 'Todos' };

function AdminMensagens() {
  const [chamados, setChamados] = useState(CHAMADOS_INICIAIS);
  const [selecionado, setSelecionado] = useState(CHAMADOS_INICIAIS[0]);
  const [filtro, setFiltro] = useState('ABERTOS');
  const [resposta, setResposta] = useState('');
  const [aviso, setAviso] = useState('');
  const [detalheMovelAberto, setDetalheMovelAberto] = useState(false);
  const [menuFiltroAberto, setMenuFiltroAberto] = useState(false);
  const filtroRef = useRef(null);

  useEffect(() => {
    const fecharAoClicarFora = (event) => {
      if (filtroRef.current && !filtroRef.current.contains(event.target)) setMenuFiltroAberto(false);
    };
    const fecharComEsc = (event) => { if (event.key === 'Escape') setMenuFiltroAberto(false); };
    document.addEventListener('mousedown', fecharAoClicarFora);
    document.addEventListener('keydown', fecharComEsc);
    return () => {
      document.removeEventListener('mousedown', fecharAoClicarFora);
      document.removeEventListener('keydown', fecharComEsc);
    };
  }, []);

  const visiveis = useMemo(() => chamados.filter((chamado) =>
    filtro === 'TODOS' || (filtro === 'ABERTOS' ? chamado.status !== 'RESOLVIDO' : chamado.status === filtro)
  ), [chamados, filtro]);
  const abertos = chamados.filter((chamado) => chamado.status === 'ABERTO').length;
  const emAndamento = chamados.filter((chamado) => chamado.status === 'EM_ANDAMENTO').length;

  const enviarResposta = () => {
    if (!resposta.trim()) { setAviso('Escreva uma resposta antes de enviar.'); return; }
    setChamados((atuais) => atuais.map((chamado) => chamado.id === selecionado.id
      ? { ...chamado, status: 'EM_ANDAMENTO', atualizacao: 'Agora', ultimaResposta: resposta.trim() }
      : chamado));
    setSelecionado((atual) => ({ ...atual, status: 'EM_ANDAMENTO', atualizacao: 'Agora', ultimaResposta: resposta.trim() }));
    setResposta('');
    setAviso('');
  };

  const concluir = () => {
    setChamados((atuais) => atuais.map((chamado) => chamado.id === selecionado.id ? { ...chamado, status: 'RESOLVIDO', atualizacao: 'Agora' } : chamado));
    setSelecionado((atual) => ({ ...atual, status: 'RESOLVIDO', atualizacao: 'Agora' }));
    setAviso('');
  };

  return <section>
    <div className="adm-titulo-pagina"><h1>Mensagens de suporte</h1><p>Atendimento oficial e solicitações enviadas ao suporte da plataforma.</p></div>
    <Aviso>{aviso}</Aviso>
    <div className="adm-contadores-operacao" aria-label="Resumo dos chamados">
      <button type="button" className={filtro === 'ABERTO' ? 'adm-contador-ativo' : ''} onClick={() => setFiltro('ABERTO')} aria-pressed={filtro === 'ABERTO'}><strong>{abertos}</strong> novo(s)</button>
      <button type="button" className={`adm-contador-atencao ${filtro === 'EM_ANDAMENTO' ? 'adm-contador-ativo' : ''}`} onClick={() => setFiltro('EM_ANDAMENTO')} aria-pressed={filtro === 'EM_ANDAMENTO'}><strong>{emAndamento}</strong> em andamento</button>
      <button type="button" className={filtro === 'TODOS' ? 'adm-contador-ativo' : ''} onClick={() => setFiltro('TODOS')} aria-pressed={filtro === 'TODOS'}><strong>{chamados.length}</strong> no total</button>
    </div>
    <div className="adm-filtros"><div className="adm-filtro-suporte" ref={filtroRef}><button type="button" className="adm-filtro-suporte-gatilho" onClick={() => setMenuFiltroAberto((aberto) => !aberto)} aria-haspopup="listbox" aria-expanded={menuFiltroAberto}><span>Exibir: <strong>{ROTULOS_FILTRO[filtro]}</strong></span><ChevronDown size={17} aria-hidden="true" /></button>{menuFiltroAberto && <div className="adm-filtro-suporte-opcoes" role="listbox" aria-label="Filtrar chamados">{Object.entries(ROTULOS_FILTRO).map(([valor, rotulo]) => <button type="button" key={valor} role="option" aria-selected={filtro === valor} onClick={() => { setFiltro(valor); setMenuFiltroAberto(false); }}><span>{rotulo}</span>{filtro === valor && <Check size={16} aria-hidden="true" />}</button>)}</div>}</div></div>
    <div className={`adm-suporte-layout ${detalheMovelAberto ? 'detalhe-aberto' : ''}`}>
      <div className="adm-suporte-lista" aria-label="Lista de chamados">
        {visiveis.length === 0 ? <p className="adm-texto-suave">Nenhum chamado neste filtro.</p> : visiveis.map((chamado) => <button className={`adm-suporte-item ${selecionado?.id === chamado.id ? 'ativo' : ''}`} key={chamado.id} onClick={() => { setSelecionado(chamado); setResposta(''); setDetalheMovelAberto(true); }}>
          <span className="adm-suporte-item-topo"><strong>{chamado.conta}</strong><span>{chamado.atualizacao}</span></span><span>{chamado.assunto}</span><small>{chamado.tipoConta} · {chamado.status.replace('_', ' ')}</small>
        </button>)}
      </div>
      <div className="adm-suporte-detalhe">
        {!selecionado ? <p className="adm-texto-suave">Selecione um chamado para analisar.</p> : <>
          <div className="adm-suporte-cabecalho"><div><button className="adm-voltar-chamados" type="button" onClick={() => setDetalheMovelAberto(false)}>← Todos os chamados</button><span className="adm-badge adm-badge-tipo">{selecionado.id}</span><h2>{selecionado.assunto}</h2><p className="adm-texto-suave">{selecionado.conta} · {selecionado.tipoConta}</p></div><span className="adm-badge adm-badge-tipo">{selecionado.status.replace('_', ' ')}</span></div>
          <div className="adm-chat-mensagens" aria-label="Histórico do chamado">
            <div className="adm-chat-bolha adm-chat-recebida"><span>{selecionado.conta}</span><p>{selecionado.mensagem}</p><small>{selecionado.atualizacao}</small></div>
            {selecionado.ultimaResposta && <div className="adm-chat-bolha adm-chat-enviada"><span>Suporte HELP</span><p>{selecionado.ultimaResposta}</p><small>{selecionado.atualizacao}</small></div>}
          </div>
          <label className="adm-label adm-chat-compositor"><textarea aria-label="Resposta oficial" value={resposta} onChange={(event) => setResposta(event.target.value)} maxLength="1000" placeholder="Escreva a orientação para esta solicitação." /></label>
          <div className="adm-acoes"><button className="adm-botao adm-botao-secundario" onClick={concluir} disabled={selecionado.status === 'RESOLVIDO'}><CheckCircle2 size={15} /> Marcar resolvido</button><button className="adm-botao adm-botao-primario" onClick={enviarResposta}><Send size={15} /> Enviar resposta</button></div>
        </>}
      </div>
    </div>
  </section>;
}

export default AdminMensagens;

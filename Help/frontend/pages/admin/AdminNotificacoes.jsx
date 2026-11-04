import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertOctagon, ArrowUpRight, BellRing, Check, CheckCheck, ChevronDown, FileWarning, Info, ShieldAlert, TriangleAlert, X } from 'lucide-react';
import { Aviso } from './adminComponentes';

const NOTIFICACOES_INICIAIS = [
  { id: 'ADM-91', categoria: 'DENUNCIAS', prioridade: 'CRITICA', titulo: 'Nova denúncia de possível assédio', descricao: 'Uma denúncia crítica entrou na fila de moderação.', data: 'Agora', lida: false },
  { id: 'ADM-90', categoria: 'SEGURANCA', prioridade: 'ALTA', titulo: 'Atividade incomum detectada', descricao: 'Foram identificadas tentativas repetidas de acesso em uma conta.', data: 'Há 18 min', lida: false },
  { id: 'ADM-89', categoria: 'MODERACAO', prioridade: 'ATENCAO', titulo: 'Volume elevado de conteúdo sinalizado', descricao: 'Há itens aguardando revisão na moderação.', data: 'Hoje, 09:12', lida: false },
  { id: 'ADM-88', categoria: 'RESTRITAS', prioridade: 'INFORMATIVA', titulo: 'Rotina administrativa concluída', descricao: 'A verificação programada foi concluída sem pendências.', data: 'Ontem, 16:30', lida: true }
];

const CONFIGURACAO = { DENUNCIAS: { rotulo: 'Denúncias', icone: FileWarning }, SEGURANCA: { rotulo: 'Segurança', icone: ShieldAlert }, MODERACAO: { rotulo: 'Moderação', icone: TriangleAlert }, RESTRITAS: { rotulo: 'Restritas', icone: Info } };
const PRIORIDADES = { CRITICA: { rotulo: 'Crítica: ação imediata', icone: AlertOctagon }, ALTA: { rotulo: 'Alta: requer atenção', icone: BellRing }, ATENCAO: { rotulo: 'Atenção: revisar fila', icone: TriangleAlert }, INFORMATIVA: { rotulo: 'Informativa', icone: Info } };
const DESTINOS_ALERTA = { DENUNCIAS: { rota: '/admin/denuncias', rotulo: 'Abrir denúncias' }, SEGURANCA: { rota: '/admin/usuarios', rotulo: 'Abrir usuários' }, MODERACAO: { rota: '/admin/denuncias', rotulo: 'Abrir moderação' }, RESTRITAS: { rota: '/admin', rotulo: 'Abrir visão geral' } };

function AdminNotificacoes() {
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState(NOTIFICACOES_INICIAIS);
  const [categoria, setCategoria] = useState('TODAS');
  const [somenteNaoLidas, setSomenteNaoLidas] = useState(false);
  const [aviso, setAviso] = useState('');
  const [selecionada, setSelecionada] = useState(null);
  const [menuCategoriaAberto, setMenuCategoriaAberto] = useState(false);
  const filtroCategoriaRef = useRef(null);

  useEffect(() => {
    const fecharAoClicarFora = (event) => {
      if (filtroCategoriaRef.current && !filtroCategoriaRef.current.contains(event.target)) setMenuCategoriaAberto(false);
    };
    const fecharComEsc = (event) => { if (event.key === 'Escape') setMenuCategoriaAberto(false); };
    document.addEventListener('mousedown', fecharAoClicarFora);
    document.addEventListener('keydown', fecharComEsc);
    return () => {
      document.removeEventListener('mousedown', fecharAoClicarFora);
      document.removeEventListener('keydown', fecharComEsc);
    };
  }, []);
  const visiveis = useMemo(() => notificacoes.filter((notificacao) => (categoria === 'TODAS' || notificacao.categoria === categoria) && (!somenteNaoLidas || !notificacao.lida)), [categoria, notificacoes, somenteNaoLidas]);
  const marcarLida = (id) => setNotificacoes((atuais) => atuais.map((notificacao) => notificacao.id === id ? { ...notificacao, lida: true } : notificacao));
  const abrirPrevia = (notificacao) => { marcarLida(notificacao.id); setSelecionada({ ...notificacao, lida: true }); };
  const marcarTodas = () => { setNotificacoes((atuais) => atuais.map((notificacao) => ({ ...notificacao, lida: true }))); setAviso(''); };
  const naoLidas = notificacoes.filter((notificacao) => !notificacao.lida).length;

  return <section>
    <div className="adm-titulo-pagina"><h1>Notificações administrativas</h1><p>Alertas internos separados das notificações comuns da plataforma.</p></div>
    <Aviso>{aviso}</Aviso>
    <div className="adm-notificacoes-resumo"><div><strong>{naoLidas}</strong><span>não lida(s)</span></div><button className="adm-botao adm-botao-secundario" onClick={marcarTodas} disabled={!naoLidas}><CheckCheck size={16} /> Marcar todas como lidas</button></div>
    <div className="adm-filtros"><div className="adm-filtro-notificacoes" ref={filtroCategoriaRef}><button type="button" className="adm-filtro-notificacoes-gatilho" onClick={() => setMenuCategoriaAberto((aberto) => !aberto)} aria-haspopup="listbox" aria-expanded={menuCategoriaAberto}><span>Categoria: <strong>{categoria === 'TODAS' ? 'Todas' : CONFIGURACAO[categoria].rotulo}</strong></span><ChevronDown size={17} aria-hidden="true" /></button>{menuCategoriaAberto && <div className="adm-filtro-notificacoes-opcoes" role="listbox" aria-label="Filtrar categoria">{[['TODAS', 'Todas as categorias'], ...Object.entries(CONFIGURACAO).map(([chave, valor]) => [chave, valor.rotulo])].map(([valor, rotulo]) => <button type="button" key={valor} role="option" aria-selected={categoria === valor} onClick={() => { setCategoria(valor); setMenuCategoriaAberto(false); }}><span>{rotulo}</span>{categoria === valor && <Check size={16} aria-hidden="true" />}</button>)}</div>}</div><label className="adm-checkbox"><input type="checkbox" checked={somenteNaoLidas} onChange={(event) => setSomenteNaoLidas(event.target.checked)} /> Somente não lidas</label></div>
    <div className="adm-notificacoes-lista">{visiveis.length === 0 ? <p className="adm-vazio">Nenhuma notificação neste filtro.</p> : visiveis.map((notificacao) => {
      const CategoriaIcone = CONFIGURACAO[notificacao.categoria].icone; const PrioridadeIcone = PRIORIDADES[notificacao.prioridade].icone;
      return <button key={notificacao.id} className={`adm-notificacao ${notificacao.lida ? 'lida' : 'nao-lida'} adm-notificacao-${notificacao.prioridade.toLowerCase()}`} onClick={() => abrirPrevia(notificacao)} aria-label={`Abrir alerta: ${PRIORIDADES[notificacao.prioridade].rotulo}. ${notificacao.titulo}.`}><span className="adm-notificacao-icone"><CategoriaIcone size={22} /></span><span className="adm-notificacao-corpo"><span className="adm-notificacao-topo"><strong>{notificacao.titulo}</strong><time>{notificacao.data}</time></span><span>{notificacao.descricao}</span><small><PrioridadeIcone size={14} /> {PRIORIDADES[notificacao.prioridade].rotulo} · {CONFIGURACAO[notificacao.categoria].rotulo}</small></span>{!notificacao.lida && <span className="adm-notificacao-ponto" aria-hidden="true" />}</button>;
    })}</div>
    {selecionada && (() => {
      const CategoriaIcone = CONFIGURACAO[selecionada.categoria].icone;
      const PrioridadeIcone = PRIORIDADES[selecionada.prioridade].icone;
      const destino = DESTINOS_ALERTA[selecionada.categoria];
      return <div className="adm-modal-overlay" role="presentation"><section className="adm-modal adm-modal-alerta" role="dialog" aria-modal="true" aria-labelledby="titulo-alerta"><div className="adm-modal-topo"><div><span className={`adm-prioridade adm-prioridade-${selecionada.prioridade.toLowerCase()}`}>{PRIORIDADES[selecionada.prioridade].rotulo}</span><h2 id="titulo-alerta">{selecionada.titulo}</h2></div><button type="button" className="adm-botao adm-botao-secundario" onClick={() => setSelecionada(null)}><X size={16} /> Fechar</button></div><div className="adm-alerta-detalhe-icone"><CategoriaIcone size={22} /></div><p className="adm-alerta-detalhe-texto">{selecionada.descricao}</p><div className="adm-paineis"><div className="adm-painel"><h2>Classificação</h2><p className="adm-texto-suave"><PrioridadeIcone size={15} /> {PRIORIDADES[selecionada.prioridade].rotulo}</p><p className="adm-texto-suave">Categoria: {CONFIGURACAO[selecionada.categoria].rotulo}</p></div><div className="adm-painel"><h2>Registro</h2><p className="adm-texto-suave">Código: {selecionada.id}</p><p className="adm-texto-suave">Recebido: {selecionada.data}</p></div></div><div className="adm-acoes"><button type="button" className="adm-botao adm-botao-primario" onClick={() => { setSelecionada(null); navigate(destino.rota); }}><ArrowUpRight size={16} /> {destino.rotulo}</button></div></section></div>;
    })()}
  </section>;
}

export default AdminNotificacoes;

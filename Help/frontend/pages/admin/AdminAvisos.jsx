import React, { useEffect, useRef, useState } from 'react';
import { Archive, BellRing, CalendarDays, Check, ChevronDown, Eye, Pause, Play, Send, XCircle } from 'lucide-react';
import { Aviso } from './adminComponentes';

const FORMULARIO_INICIAL = { titulo: '', mensagem: '', publico: 'TODOS', contaAlvo: '', prioridade: 'INFORMATIVA', destino: '/feed', agendamento: '' };
const rotulosPublico = { TODOS: 'Todas as contas', USUARIOS: 'Pessoas usuárias', EMPRESAS: 'Empresas', ADMINS: 'Administradores', CONTA: 'Uma conta específica' };
const OPCOES_PRIORIDADE = [['INFORMATIVA', 'Informativa'], ['ATENCAO', 'Atenção'], ['ALTA', 'Alta'], ['CRITICA', 'Crítica']];
const OPCOES_DESTINO = [['/feed', 'Início'], ['/vagas', 'Vagas'], ['/cursos', 'Cursos'], ['/mensagens', 'Mensagens']];

function SeletorAviso({ rotulo, valor, opcoes, aoMudar }) {
  const [aberto, setAberto] = useState(false);
  const seletorRef = useRef(null);
  const textoAtual = opcoes.find(([chave]) => chave === valor)?.[1] || valor;

  useEffect(() => {
    const fecharAoClicarFora = (event) => {
      if (seletorRef.current && !seletorRef.current.contains(event.target)) setAberto(false);
    };
    const fecharComEsc = (event) => { if (event.key === 'Escape') setAberto(false); };
    document.addEventListener('mousedown', fecharAoClicarFora);
    document.addEventListener('keydown', fecharComEsc);
    return () => {
      document.removeEventListener('mousedown', fecharAoClicarFora);
      document.removeEventListener('keydown', fecharComEsc);
    };
  }, []);

  return <div className="adm-seletor-aviso" ref={seletorRef}><button type="button" className="adm-seletor-aviso-gatilho" onClick={() => setAberto((atual) => !atual)} aria-label={rotulo} aria-haspopup="listbox" aria-expanded={aberto}><span>{textoAtual}</span><ChevronDown size={17} aria-hidden="true" /></button>{aberto && <div className="adm-seletor-aviso-opcoes" role="listbox" aria-label={rotulo}>{opcoes.map(([chave, texto]) => <button type="button" key={chave} role="option" aria-selected={valor === chave} onClick={() => { aoMudar(chave); setAberto(false); }}><span>{texto}</span>{valor === chave && <Check size={16} aria-hidden="true" />}</button>)}</div>}</div>;
}

function AdminAvisos() {
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [avisos, setAvisos] = useState([{ id: 'AV-17', titulo: 'Manutenção programada', publico: 'TODOS', prioridade: 'ATENCAO', destino: '/feed', status: 'AGENDADO', agendamento: '05/11, 22:00' }, { id: 'AV-16', titulo: 'Boas-vindas às novas empresas', publico: 'EMPRESAS', prioridade: 'INFORMATIVA', destino: '/dashboard-rh', status: 'ATIVO', agendamento: 'Agora' }]);
  const [aviso, setAviso] = useState('');
  const atualizar = (campo, valor) => setFormulario((atual) => ({ ...atual, [campo]: valor }));
  const salvar = (status) => {
    if (!formulario.titulo.trim() || !formulario.mensagem.trim() || (formulario.publico === 'CONTA' && !formulario.contaAlvo.trim())) { setAviso('Preencha título, mensagem e, quando aplicável, a conta de destino.'); return; }
    setAvisos((atuais) => [{ id: `AV-${atuais.length + 18}`, ...formulario, titulo: formulario.titulo.trim(), status, agendamento: formulario.agendamento || 'Agora' }, ...atuais]);
    setFormulario(FORMULARIO_INICIAL); setAviso('');
  };
  const alterarStatus = (id, status) => setAvisos((atuais) => atuais.map((item) => item.id === id ? { ...item, status } : item));
  const duplicar = (id) => setAvisos((atuais) => {
    const original = atuais.find((item) => item.id === id);
    return original ? [{ ...original, id: `AV-${atuais.length + 18}`, titulo: `${original.titulo} (cópia)`, status: 'RASCUNHO', agendamento: '—' }, ...atuais] : atuais;
  });
  return <section>
    <div className="adm-titulo-pagina"><h1>Criador de avisos</h1><p>Comunicados oficiais para públicos definidos, com prévia e ciclo de vida controlado.</p></div>
    <Aviso>{aviso}</Aviso>
    <div className="adm-avisos-grid"><form className="adm-painel adm-aviso-form" onSubmit={(event) => { event.preventDefault(); salvar(formulario.agendamento ? 'AGENDADO' : 'ATIVO'); }}><h2>Novo aviso</h2>
      <div className="adm-label"><span>Público</span><SeletorAviso rotulo="Público" valor={formulario.publico} opcoes={Object.entries(rotulosPublico)} aoMudar={(valor) => atualizar('publico', valor)} /></div>
      {formulario.publico === 'CONTA' && <label className="adm-label">Identificador da conta<input value={formulario.contaAlvo} onChange={(event) => atualizar('contaAlvo', event.target.value)} maxLength="120" placeholder="tipoConta:id" /></label>}
      <label className="adm-label">Título<input value={formulario.titulo} onChange={(event) => atualizar('titulo', event.target.value)} maxLength="90" placeholder="Ex.: Atualização importante" /></label><label className="adm-label">Mensagem<textarea value={formulario.mensagem} onChange={(event) => atualizar('mensagem', event.target.value)} maxLength="500" placeholder="Escreva o comunicado oficial." /></label>
      <div className="adm-form-duplo"><div className="adm-label"><span>Prioridade</span><SeletorAviso rotulo="Prioridade" valor={formulario.prioridade} opcoes={OPCOES_PRIORIDADE} aoMudar={(valor) => atualizar('prioridade', valor)} /></div><div className="adm-label"><span>Destino</span><SeletorAviso rotulo="Destino" valor={formulario.destino} opcoes={OPCOES_DESTINO} aoMudar={(valor) => atualizar('destino', valor)} /></div></div>
      <label className="adm-label">Agendar para depois (opcional)<span className="adm-data-input"><input type="datetime-local" value={formulario.agendamento} onChange={(event) => atualizar('agendamento', event.target.value)} /><CalendarDays size={18} aria-hidden="true" /></span></label><div className="adm-acoes"><button type="button" className="adm-botao adm-botao-secundario" onClick={() => salvar('RASCUNHO')}><Archive size={15} /> Salvar rascunho</button><button type="submit" className="adm-botao adm-botao-primario"><Send size={15} /> {formulario.agendamento ? 'Agendar aviso' : 'Publicar aviso'}</button></div>
    </form><aside className="adm-painel adm-preview-aviso"><div className="adm-preview-cabecalho"><Eye size={18} /><h2>Pré-visualização</h2></div><div className={`adm-preview-cartao adm-preview-${formulario.prioridade.toLowerCase()}`}><BellRing size={22} /><div><strong>{formulario.titulo || 'Título do aviso'}</strong><p>{formulario.mensagem || 'A mensagem aparecerá aqui antes da publicação.'}</p><small>Para: {rotulosPublico[formulario.publico]} · Destino: {formulario.destino}</small></div></div><p className="adm-texto-suave">Confira o público e o destino antes de publicar.</p></aside></div>
    <section className="adm-painel"><h2>Avisos locais</h2><div className="adm-tabela-wrapper"><table className="adm-tabela"><thead><tr><th>Aviso</th><th>Público</th><th>Prioridade</th><th>Entrega</th><th>Status</th><th>Ações</th></tr></thead><tbody>{avisos.map((item) => <tr key={item.id}><td data-label="Aviso"><strong>{item.titulo}</strong><br /><span className="adm-texto-suave">{item.id}</span></td><td data-label="Público">{rotulosPublico[item.publico]}</td><td data-label="Prioridade"><span className={`adm-prioridade adm-prioridade-${item.prioridade.toLowerCase()}`}>{item.prioridade}</span></td><td data-label="Entrega">{item.agendamento}</td><td data-label="Status"><span className="adm-badge adm-badge-tipo">{item.status}</span></td><td data-label="Ações"><div className="adm-acoes">{['ATIVO', 'AGENDADO'].includes(item.status) && <button className="adm-botao adm-botao-secundario" onClick={() => alterarStatus(item.id, 'PAUSADO')}><Pause size={14} /> Pausar</button>}{item.status === 'PAUSADO' && <button className="adm-botao adm-botao-secundario" onClick={() => alterarStatus(item.id, 'ATIVO')}><Play size={14} /> Retomar</button>}<button className="adm-botao adm-botao-secundario" onClick={() => duplicar(item.id)}><Archive size={14} /> Duplicar</button>{!['ENCERRADO', 'RASCUNHO'].includes(item.status) && <button className="adm-botao adm-botao-perigo" onClick={() => alterarStatus(item.id, 'ENCERRADO')}><XCircle size={14} /> Encerrar</button>}</div></td></tr>)}</tbody></table></div></section>
  </section>;
}
export default AdminAvisos;

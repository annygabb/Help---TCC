import React, { useEffect, useState } from 'react';
import { BellRing, Eye, Send } from 'lucide-react';
import { Aviso } from './adminComponentes';
import api from '../../services/api';
const INICIAL={titulo:'',mensagem:'',publico:'TODOS',prioridade:'INFORMATIVA',destino:'/feed'};
const PUBLICOS={TODOS:'Todas as contas',USUARIOS:'Pessoas usuárias',EMPRESAS:'Empresas'};
export default function AdminAvisos(){
 const [formulario,setFormulario]=useState(INICIAL),[avisos,setAvisos]=useState([]),[mensagem,setMensagem]=useState(''),[enviando,setEnviando]=useState(false);
 const carregar=async()=>{try{const{data}=await api.get('/admin/avisos');setAvisos(data||[]);}catch{setMensagem('Não foi possível carregar o histórico de avisos.');}};
 useEffect(()=>{carregar();},[]);
 const atualizar=(campo,valor)=>setFormulario(a=>({...a,[campo]:valor}));
 const publicar=async(event)=>{event.preventDefault();if(!formulario.titulo.trim()||!formulario.mensagem.trim())return setMensagem('Preencha o título e a mensagem.');setEnviando(true);setMensagem('');try{const{data}=await api.post('/admin/avisos',formulario);setAvisos(a=>[data,...a]);setFormulario(INICIAL);setMensagem(`Aviso publicado e entregue para ${data.entregues} conta(s).`);}catch(erro){setMensagem(erro.response?.data?.message||erro.response?.data?.error||'Não foi possível publicar o aviso.');}finally{setEnviando(false);}};
 return <section><div className="adm-titulo-pagina"><h1>Criador de avisos</h1><p>Comunicados oficiais entregues nas notificações das contas selecionadas.</p></div><Aviso>{mensagem}</Aviso>
 <div className="adm-avisos-grid"><form className="adm-painel adm-aviso-form" onSubmit={publicar}><h2>Novo aviso</h2>
 <label className="adm-label">Público<select value={formulario.publico} onChange={e=>atualizar('publico',e.target.value)}>{Object.entries(PUBLICOS).map(([v,r])=><option key={v} value={v}>{r}</option>)}</select></label>
 <label className="adm-label">Título<input value={formulario.titulo} onChange={e=>atualizar('titulo',e.target.value)} maxLength="90" required/></label>
 <label className="adm-label">Mensagem<textarea value={formulario.mensagem} onChange={e=>atualizar('mensagem',e.target.value)} maxLength="500" required/></label>
 <div className="adm-form-duplo"><label className="adm-label">Prioridade<select value={formulario.prioridade} onChange={e=>atualizar('prioridade',e.target.value)}><option>INFORMATIVA</option><option>ATENCAO</option><option>ALTA</option><option>CRITICA</option></select></label><label className="adm-label">Destino<select value={formulario.destino} onChange={e=>atualizar('destino',e.target.value)}><option value="/feed">Início</option><option value="/vagas">Vagas</option><option value="/cursos">Cursos</option><option value="/mensagens">Mensagens</option></select></label></div>
 <div className="adm-acoes"><button disabled={enviando} className="adm-botao adm-botao-primario"><Send size={15}/>{enviando?'Publicando...':'Publicar aviso'}</button></div></form>
 <aside className="adm-painel adm-preview-aviso"><div className="adm-preview-cabecalho"><Eye size={18}/><h2>Pré-visualização</h2></div><div className={`adm-preview-cartao adm-preview-${formulario.prioridade.toLowerCase()}`}><BellRing size={22}/><div><strong>{formulario.titulo||'Título do aviso'}</strong><p>{formulario.mensagem||'A mensagem aparecerá aqui.'}</p><small>Para: {PUBLICOS[formulario.publico]}</small></div></div></aside></div>
 <section className="adm-painel"><h2>Avisos publicados</h2><div className="adm-tabela-wrapper"><table className="adm-tabela"><thead><tr><th>Aviso</th><th>Público</th><th>Prioridade</th><th>Entregues</th><th>Publicação</th></tr></thead><tbody>{avisos.map(item=><tr key={item.id}><td><strong>{item.titulo}</strong><br/><span className="adm-texto-suave">{item.mensagem}</span></td><td>{PUBLICOS[item.publico]}</td><td>{item.prioridade}</td><td>{item.entregues}</td><td>{item.criadoEm?new Date(`${item.criadoEm}Z`).toLocaleString('pt-BR'):'Agora'}</td></tr>)}</tbody></table></div></section></section>;
}

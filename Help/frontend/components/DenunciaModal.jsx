import React, { useState } from 'react';
import { criarDenuncia } from '../services/denuncias';
import './DenunciaModal.css';

export default function DenunciaModal({ alvoTipo, alvoId, alvoNome, onClose }) {
  const [motivo, setMotivo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const enviar = async (event) => {
    event.preventDefault();
    if (!motivo) return;
    setEnviando(true);
    try {
      await criarDenuncia({ alvoTipo, alvoId, motivo, descricao });
      alert('Denúncia enviada para análise.');
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || error.response?.data?.error || 'Não foi possível enviar a denúncia.');
    } finally { setEnviando(false); }
  };
  return <div className="denuncia-overlay" role="presentation" onClick={onClose}>
    <form className="denuncia-modal" role="dialog" aria-modal="true" onSubmit={enviar} onClick={(e) => e.stopPropagation()}>
      <div className="denuncia-topo"><h2>Denunciar {alvoNome}</h2><button type="button" onClick={onClose}>Fechar</button></div>
      <label>Motivo<select required value={motivo} onChange={(e) => setMotivo(e.target.value)}><option value="">Selecione</option><option>Conteúdo impróprio</option><option>Assédio ou ameaça</option><option>Informação enganosa</option><option>Fraude</option><option>Spam</option><option>Outro</option></select></label>
      <label>Detalhes<textarea maxLength="2000" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Explique o ocorrido para a equipe de moderação." /></label>
      <div className="denuncia-acoes"><button type="button" onClick={onClose}>Cancelar</button><button className="primario" disabled={enviando || !motivo}>{enviando ? 'Enviando...' : 'Enviar denúncia'}</button></div>
    </form>
  </div>;
}

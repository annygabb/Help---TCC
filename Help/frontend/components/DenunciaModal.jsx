import React, { useEffect, useId, useRef, useState } from 'react';
import { CircleCheckBig, Flag, X } from 'lucide-react';
import { criarDenuncia } from '../services/denuncias';
import {
  LIMITE_DESCRICAO_DENUNCIA,
  MOTIVOS_DENUNCIA,
  mensagemErroDenuncia,
  protocoloDaDenuncia
} from '../utils/denuncias';
import './DenunciaModal.css';

const SELETOR_FOCAVEL = 'button:not([disabled]), select:not([disabled]), textarea:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export default function DenunciaModal({ alvoTipo, alvoId, alvoNome, onClose, onEnviada }) {
  const idTitulo = useId();
  const idAjuda = useId();
  const idContador = useId();
  const modalRef = useRef(null);
  const motivoRef = useRef(null);
  const enviarRef = useRef(null);
  const fecharRef = useRef(null);
  const enviandoRef = useRef(false);
  const cliqueComecouFora = useRef(false);

  const [motivo, setMotivo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [enviada, setEnviada] = useState(null);

  const fechar = () => {
    if (!enviandoRef.current) onClose();
  };
  const fecharAtual = useRef(fechar);
  useEffect(() => {
    fecharAtual.current = fechar;
  });

  // Ao abrir: trava a rolagem da página e leva o foco ao primeiro campo.
  // Ao fechar: devolve o foco para o botão que abriu o modal.
  useEffect(() => {
    const focoAnterior = document.activeElement;
    const rolagemAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    motivoRef.current?.focus();
    return () => {
      document.body.style.overflow = rolagemAnterior;
      if (focoAnterior?.focus && document.contains(focoAnterior)) focoAnterior.focus();
    };
  }, []);

  // Esc fecha; Tab e Shift+Tab ficam presos dentro do modal.
  useEffect(() => {
    const aoTeclar = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        fecharAtual.current();
        return;
      }
      if (event.key !== 'Tab' || !modalRef.current) return;
      const focaveis = [...modalRef.current.querySelectorAll(SELETOR_FOCAVEL)];
      if (!focaveis.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      const focoDentro = modalRef.current.contains(document.activeElement);
      if (event.shiftKey && (!focoDentro || document.activeElement === primeiro)) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && (!focoDentro || document.activeElement === ultimo)) {
        event.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, []);

  useEffect(() => {
    if (enviada) fecharRef.current?.focus();
  }, [enviada]);

  useEffect(() => {
    if (erro) enviarRef.current?.focus();
  }, [erro]);

  const enviar = async (event) => {
    event.preventDefault();
    if (!motivo || enviandoRef.current) return;
    enviandoRef.current = true;
    setEnviando(true);
    setErro(null);
    try {
      const resposta = await criarDenuncia({
        alvoTipo,
        alvoId,
        motivo,
        descricao: descricao.trim() || null
      });
      setEnviada(resposta || {});
      onEnviada?.(resposta);
    } catch (error) {
      setErro(mensagemErroDenuncia(error));
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }
  };

  // Clique no fundo escuro só fecha se o formulário ainda estiver vazio,
  // para a pessoa não perder o que escreveu sem querer.
  const formularioVazio = !motivo && !descricao.trim();
  const aoPressionarFundo = (event) => {
    cliqueComecouFora.current = event.target === event.currentTarget;
  };
  const aoClicarFundo = (event) => {
    if (cliqueComecouFora.current && event.target === event.currentTarget && (enviada || formularioVazio)) fechar();
  };

  const protocolo = protocoloDaDenuncia(enviada?.id);

  return (
    <div className="denuncia-overlay" role="presentation" onMouseDown={aoPressionarFundo} onClick={aoClicarFundo}>
      <div
        ref={modalRef}
        className="denuncia-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={enviada ? undefined : idAjuda}
      >
        {enviada ? (
          <div className="denuncia-sucesso" role="status">
            <CircleCheckBig size={44} aria-hidden="true" />
            <h2 id={idTitulo}>Denúncia enviada</h2>
            <p>Recebemos sua denúncia sobre {alvoTipo === 'PUBLICACAO' ? 'a ' : ''}<strong>{alvoNome}</strong>. A equipe de moderação vai analisar o caso.</p>
            {protocolo && (
              <p className="denuncia-protocolo">
                Protocolo <strong>{protocolo}</strong>
              </p>
            )}
            <p className="denuncia-nota">Quem foi denunciado não fica sabendo quem fez a denúncia.</p>
            <div className="denuncia-acoes">
              <button ref={fecharRef} type="button" className="primario" onClick={onClose}>Fechar</button>
            </div>
          </div>
        ) : (
          <form onSubmit={enviar}>
            <div className="denuncia-topo">
              <h2 id={idTitulo}><Flag size={20} aria-hidden="true" /> Denunciar {alvoNome}</h2>
              <button type="button" className="denuncia-fechar" onClick={fechar} disabled={enviando} aria-label="Fechar">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <p id={idAjuda} className="denuncia-ajuda">
              A equipe de moderação analisa cada denúncia. Quem foi denunciado não fica sabendo quem denunciou.
            </p>

            <label>
              Motivo
              <select ref={motivoRef} required value={motivo} onChange={(e) => setMotivo(e.target.value)} disabled={enviando}>
                <option value="">Selecione um motivo</option>
                {MOTIVOS_DENUNCIA.map((opcao) => <option key={opcao} value={opcao}>{opcao}</option>)}
              </select>
            </label>

            <label>
              <span>Detalhes <span className="denuncia-opcional">(opcional)</span></span>
              <textarea
                maxLength={LIMITE_DESCRICAO_DENUNCIA}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Explique o ocorrido para a equipe de moderação."
                disabled={enviando}
                aria-describedby={idContador}
              />
            </label>
            <div id={idContador} className="denuncia-contador">
              {descricao.length}/{LIMITE_DESCRICAO_DENUNCIA}
            </div>

            {erro && <p className="denuncia-erro" role="alert">{erro.mensagem}</p>}

            <div className="denuncia-acoes">
              <button type="button" onClick={fechar} disabled={enviando}>Cancelar</button>
              <button ref={enviarRef} type="submit" className="primario" disabled={enviando || !motivo} aria-busy={enviando}>
                {enviando ? 'Enviando...' : erro?.podeTentarDeNovo ? 'Tentar novamente' : 'Enviar denúncia'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

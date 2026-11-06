import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Building2, Flag, MessageSquare, UserMinus, UserPlus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { obterContato } from '../services/comunicacao';
import { consultarContagem, consultarStatus, deixarDeSeguir, seguir } from '../services/seguidores';
import { obterSessao } from '../services/session';
import './PerfilPublico.css';
import DenunciaModal from '../components/DenunciaModal';

const mensagemDoErro = (erro, padrao) =>
  erro?.response?.data?.mensagem || erro?.response?.data?.message || erro?.response?.data || padrao;

export default function PerfilPublico() {
  const { tipo, id } = useParams();
  const navigate = useNavigate();
  const [conta, setConta] = useState(null);
  const [contagem, setContagem] = useState({ seguidores: 0, seguindo: 0 });
  const [carregando, setCarregando] = useState(true);
  const [atualizandoSeguimento, setAtualizandoSeguimento] = useState(false);
  const [erro, setErro] = useState('');
  const [denunciando, setDenunciando] = useState(false);

  const carregar = useCallback(async () => {
    const referencia = { contaId: id, tipoConta: tipo };
    setCarregando(true);
    setErro('');
    try {
      const [dadosDaConta, numeros, seguindo] = await Promise.all([
        obterContato(referencia),
        consultarContagem(referencia),
        consultarStatus(referencia)
      ]);
      setConta({ ...dadosDaConta, seguindo });
      setContagem(numeros);
    } catch (error) {
      setConta(null);
      setErro(mensagemDoErro(error, 'Não foi possível carregar este perfil.'));
    } finally {
      setCarregando(false);
    }
  }, [id, tipo]);

  useEffect(() => { carregar(); }, [carregar]);

  const sessao = obterSessao();
  const contaEhDoUsuarioAtual = Boolean(
    conta && sessao?.conta?.id === conta.contaId
    && String(sessao.conta.tipoConta || 'USUARIO').toUpperCase() === conta.tipoConta
  );

  const alternarSeguir = async () => {
    if (!conta || contaEhDoUsuarioAtual || atualizandoSeguimento) return;

    setAtualizandoSeguimento(true);
    setErro('');
    try {
      if (conta.seguindo) await deixarDeSeguir(conta);
      else await seguir(conta);

      const [contaAtualizada, numeros, seguindo] = await Promise.all([
        obterContato(conta),
        consultarContagem(conta),
        consultarStatus(conta)
      ]);
      setConta({ ...contaAtualizada, seguindo });
      setContagem(numeros);
      window.dispatchEvent(new Event('help:unread-counts-changed'));
    } catch (error) {
      setErro(mensagemDoErro(error, 'Não foi possível atualizar o seguimento. Tente novamente.'));
    } finally {
      setAtualizandoSeguimento(false);
    }
  };

  if (carregando) return <main className="perfil-publico-page"><p>Carregando perfil...</p></main>;
  if (!conta) return <main className="perfil-publico-page"><p role="alert">{erro || 'Conta não encontrada.'}</p></main>;

  return (
    <main className="perfil-publico-page">
      <button className="perfil-publico-voltar" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Voltar</button>
      <section className="perfil-publico-card">
        <div className="perfil-publico-avatar">
          {conta.fotoUrl ? <img src={conta.fotoUrl} alt={`Foto de ${conta.nome}`} /> : conta.nome?.charAt(0).toUpperCase()}
        </div>
        <div className="perfil-publico-tipo">{conta.tipoConta === 'EMPRESA' ? <Building2 size={16} /> : null}{conta.tipoConta === 'EMPRESA' ? 'Empresa' : 'Profissional'}</div>
        <h1>{conta.nome}</h1>
        <p>{conta.subtitulo}</p>
        <div className="perfil-publico-numeros"><span><strong>{contagem.seguidores}</strong> seguidores</span><span><strong>{contagem.seguindo}</strong> seguindo</span></div>
        {erro && <p className="perfil-publico-erro" role="alert">{erro}</p>}
        <div className="perfil-publico-acoes">
          {contaEhDoUsuarioAtual ? (
            <span className="perfil-publico-propria-conta">Este é o seu perfil</span>
          ) : (
            <button onClick={alternarSeguir} disabled={atualizandoSeguimento} aria-busy={atualizandoSeguimento}>
              {conta.seguindo ? <UserMinus size={18} /> : <UserPlus size={18} />}
              {atualizandoSeguimento ? 'Atualizando...' : conta.seguindo ? 'Seguindo' : 'Seguir'}
            </button>
          )}
          {!contaEhDoUsuarioAtual && <button className="secundario" onClick={() => navigate('/mensagens', { state: { iniciarCom: conta } })}><MessageSquare size={18} /> Mensagem</button>}
          {!contaEhDoUsuarioAtual && <button className="secundario" onClick={() => setDenunciando(true)}><Flag size={18} /> Denunciar</button>}
        </div>
      </section>
      {denunciando && <DenunciaModal alvoTipo={conta.tipoConta} alvoId={conta.contaId} alvoNome={conta.nome} onClose={() => setDenunciando(false)} />}
    </main>
  );
}

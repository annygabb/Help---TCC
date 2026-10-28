import React, { useEffect, useState } from 'react';
import { ArrowLeft, Building2, MessageSquare, UserMinus, UserPlus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import './PerfilPublico.css';

export default function PerfilPublico() {
  const { tipo, id } = useParams();
  const navigate = useNavigate();
  const [conta, setConta] = useState(null);
  const [contagem, setContagem] = useState({ seguidores: 0, seguindo: 0 });
  const [carregando, setCarregando] = useState(true);

  const carregar = async () => {
    try {
      const [{ data }, { data: numeros }] = await Promise.all([
        api.get(`/comunicacao/contatos/${tipo}/${id}`),
        api.get(`/seguidores/contagem/${tipo}/${id}`)
      ]);
      setConta(data);
      setContagem(numeros);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); }, [tipo, id]);

  const alternarSeguir = async () => {
    if (!conta) return;
    if (conta.seguindo) await api.delete(`/seguidores/deixar-de-seguir/${conta.tipoConta}/${conta.id}`);
    else await api.post(`/seguidores/seguir/${conta.tipoConta}/${conta.id}`, {});
    await carregar();
  };

  if (carregando) return <main className="perfil-publico-page"><p>Carregando perfil...</p></main>;
  if (!conta) return <main className="perfil-publico-page"><p>Conta não encontrada.</p></main>;

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
        <div className="perfil-publico-acoes">
          <button onClick={alternarSeguir}>{conta.seguindo ? <UserMinus size={18} /> : <UserPlus size={18} />}{conta.seguindo ? 'Deixar de seguir' : 'Seguir'}</button>
          <button className="secundario" onClick={() => navigate('/mensagens', { state: { iniciarCom: conta } })}><MessageSquare size={18} /> Mensagem</button>
        </div>
      </section>
    </main>
  );
}

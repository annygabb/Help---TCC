import { useEffect, useState } from 'react';
import api from '../services/api';

export default function useUnreadCounts(intervaloMs = 15000) {
  const [naoLidas, setNaoLidas] = useState({ mensagens: 0, notificacoes: 0 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return undefined;

    const headers = { Authorization: `Bearer ${token}` };
    let ativo = true;

    const buscar = async () => {
      try {
        const [resNotificacoes, resConversas] = await Promise.all([
          api.get('/notificacoes/nao-lidas/total', { headers }),
          api.get('/mensagens/conversas', { headers })
        ]);

        if (!ativo) return;

        const totalMensagens = (resConversas.data || [])
          .reduce((soma, conversa) => soma + (conversa.naoLidas || 0), 0);

        setNaoLidas({
          notificacoes: resNotificacoes.data?.total || 0,
          mensagens: totalMensagens
        });
      } catch (error) {
        console.error('Erro ao buscar contagem de não lidas:', error);
      }
    };

    buscar();
    const intervalo = setInterval(buscar, intervaloMs);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, [intervaloMs]);

  return naoLidas;
}

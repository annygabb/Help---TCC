import { useEffect, useState } from 'react';
import api from '../services/api';
import { obterSessao } from '../services/session';
import { normalizarPerfilAtual } from '../utils/perfilAtual';

const perfilVazio = normalizarPerfilAtual({}, 'USUARIO');

export default function useCurrentProfile() {
  const [perfil, setPerfil] = useState(perfilVazio);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const sessao = obterSessao();
    if (!sessao) {
      setCarregando(false);
      return undefined;
    }

    const tipoConta = String(sessao.conta.tipoConta || 'USUARIO').toUpperCase();
    setPerfil(normalizarPerfilAtual(sessao.conta, tipoConta));

    let ativo = true;
    const endpoint = tipoConta === 'EMPRESA' ? '/empresas/me' : '/perfis/me';

    api.get(endpoint)
      .then(({ data }) => {
        if (ativo) setPerfil(normalizarPerfilAtual(data, tipoConta));
      })
      .catch((error) => {
        console.error('Erro ao carregar o perfil autenticado:', error);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  return { perfil, carregando };
}

import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './GlobalSearch.css';

const normalizar = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [aberta, setAberta] = useState(false);
  const [recentes, setRecentes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('helpRecentSearches') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    if (!termo.trim()) {
      setResultados([]);
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setCarregando(true);
      try {
        const { data } = await api.get('/comunicacao/contatos', {
          params: { busca: termo.trim() },
          signal: controller.signal
        });
        setResultados(data || []);
      } catch (error) {
        if (error.code !== 'ERR_CANCELED') setResultados([]);
      } finally {
        setCarregando(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [termo]);

  const visiveis = useMemo(() => resultados.filter((conta) =>
    normalizar(`${conta.nome} ${conta.subtitulo}`).includes(normalizar(termo))
  ), [resultados, termo]);

  const abrir = (conta) => {
    const resumo = { id: conta.id, tipoConta: conta.tipoConta, nome: conta.nome, subtitulo: conta.subtitulo };
    const novos = [resumo, ...recentes.filter((item) => `${item.tipoConta}:${item.id}` !== `${conta.tipoConta}:${conta.id}`)].slice(0, 5);
    setRecentes(novos);
    try { localStorage.setItem('helpRecentSearches', JSON.stringify(novos)); } catch { /* histórico é opcional */ }
    setAberta(false);
    setTermo('');
    navigate(`/perfil/${conta.tipoConta}/${conta.id}`);
  };

  return (
    <div className="global-search" onFocus={() => setAberta(true)}>
      <div className="search-bar global-search-input">
        <Search size={18} aria-hidden="true" />
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Pesquisar pessoas e empresas..."
          aria-label="Pesquisar pessoas e empresas"
        />
      </div>
      {aberta && (termo.trim() || recentes.length > 0) && (
        <div className="global-search-results" role="listbox">
          {!termo.trim() && recentes.length > 0 && <div className="global-search-state"><strong>Recentes</strong></div>}
          {carregando && <div className="global-search-state">Pesquisando...</div>}
          {!carregando && visiveis.length === 0 && <div className="global-search-state">Nenhuma conta encontrada.</div>}
          {!carregando && (termo.trim() ? visiveis : recentes).map((conta) => (
            <button key={`${conta.tipoConta}:${conta.id}`} type="button" onClick={() => abrir(conta)}>
              <span className="global-search-avatar">
                {conta.fotoUrl ? <img src={conta.fotoUrl} alt="" /> : conta.nome?.charAt(0).toUpperCase()}
              </span>
              <span className="global-search-copy">
                <strong>{conta.nome}</strong>
                <small>{conta.subtitulo || (conta.tipoConta === 'EMPRESA' ? 'Empresa' : 'Usuário')}</small>
              </span>
              {conta.tipoConta === 'EMPRESA' ? <Building2 size={17} /> : <User size={17} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

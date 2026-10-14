import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const formatarData = (valor) => {
  if (!valor) return '—';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '—';
  return data.toLocaleDateString('pt-BR');
};

export const formatarDataHora = (valor) => {
  if (!valor) return '—';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '—';
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};

export const formatarCnpj = (valor) => {
  const numeros = String(valor || '').replace(/\D/g, '');
  if (numeros.length !== 14) return valor || '—';
  return numeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

const NOMES_TIPO = { CANDIDATO: 'Candidato', EMPRESA: 'Empresa', ADMIN: 'Administrador' };

export const nomeDoTipo = (tipo) => NOMES_TIPO[tipo] || 'Candidato';

export function StatusBadge({ ativo }) {
  const estaAtivo = ativo !== false;
  return (
    <span className={`adm-badge ${estaAtivo ? 'adm-badge-ativo' : 'adm-badge-inativo'}`}>
      {estaAtivo ? 'Ativa' : 'Desativada'}
    </span>
  );
}

export function TipoBadge({ tipo }) {
  return <span className={`adm-badge adm-badge-tipo adm-tipo-${(tipo || 'CANDIDATO').toLowerCase()}`}>{nomeDoTipo(tipo)}</span>;
}

export function Paginacao({ pagina, totalPaginas, totalItens, aoMudar }) {
  if (!totalPaginas || totalPaginas <= 1) {
    return <div className="adm-paginacao"><span>{totalItens} registro(s)</span></div>;
  }

  return (
    <div className="adm-paginacao">
      <span>{totalItens} registro(s)</span>
      <div className="adm-paginacao-botoes">
        <button type="button" onClick={() => aoMudar(pagina - 1)} disabled={pagina <= 0} aria-label="Página anterior">
          <ChevronLeft size={18} />
        </button>
        <span>
          Página {pagina + 1} de {totalPaginas}
        </span>
        <button type="button" onClick={() => aoMudar(pagina + 1)} disabled={pagina + 1 >= totalPaginas} aria-label="Próxima página">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export function Aviso({ tipo = 'erro', children }) {
  if (!children) return null;
  return <div className={`adm-aviso adm-aviso-${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>{children}</div>;
}

export function useDebounce(valor, atraso = 400) {
  const [atrasado, setAtrasado] = React.useState(valor);
  React.useEffect(() => {
    const id = setTimeout(() => setAtrasado(valor), atraso);
    return () => clearTimeout(id);
  }, [valor, atraso]);
  return atrasado;
}

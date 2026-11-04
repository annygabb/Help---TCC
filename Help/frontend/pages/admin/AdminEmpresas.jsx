import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, ChevronDown, Search } from 'lucide-react';
import { alterarStatusEmpresa, listarEmpresas, mensagemDeErro } from '../../services/adminService';
import { Aviso, Paginacao, StatusBadge, formatarCnpj, formatarData, useDebounce } from './adminComponentes';

const TAMANHO_PAGINA = 10;

function AdminEmpresas() {
  const [parametros] = useSearchParams();
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState(() => parametros.get('status') || '');
  const [pagina, setPagina] = useState(0);
  const [resultado, setResultado] = useState({ itens: [], pagina: 0, totalPaginas: 0, totalItens: 0 });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [alterando, setAlterando] = useState(null);
  const [menuStatusAberto, setMenuStatusAberto] = useState(false);
  const filtroStatusRef = useRef(null);

  useEffect(() => {
    const fecharMenu = (event) => {
      if (filtroStatusRef.current && !filtroStatusRef.current.contains(event.target)) setMenuStatusAberto(false);
    };
    const fecharComEsc = (event) => { if (event.key === 'Escape') setMenuStatusAberto(false); };
    document.addEventListener('mousedown', fecharMenu);
    document.addEventListener('keydown', fecharComEsc);
    return () => {
      document.removeEventListener('mousedown', fecharMenu);
      document.removeEventListener('keydown', fecharComEsc);
    };
  }, []);

  const buscaAplicada = useDebounce(busca.trim());
  const ultimaRequisicao = useRef(0);

  useEffect(() => {
    setPagina(0);
  }, [buscaAplicada, status]);

  const carregar = useCallback(() => {
    const requisicao = ++ultimaRequisicao.current;
    setCarregando(true);
    setErro('');
    listarEmpresas({ busca: buscaAplicada, status, pagina, tamanho: TAMANHO_PAGINA })
      .then((dados) => {
        if (requisicao === ultimaRequisicao.current) setResultado(dados);
      })
      .catch((e) => {
        if (requisicao === ultimaRequisicao.current) setErro(mensagemDeErro(e, 'Não foi possível carregar as empresas.'));
      })
      .finally(() => {
        if (requisicao === ultimaRequisicao.current) setCarregando(false);
      });
  }, [buscaAplicada, status, pagina]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const alternarStatus = async (empresa) => {
    const ativar = empresa.ativo === false;
    const confirmar = window.confirm(
      ativar ? `Reativar a empresa ${empresa.razaoSocial}?` : `Desativar a empresa ${empresa.razaoSocial}? Ela não conseguirá mais entrar.`
    );
    if (!confirmar) return;

    setAlterando(empresa.id);
    setAviso('');
    setErro('');
    try {
      await alterarStatusEmpresa(empresa.id, ativar);
      setAviso(ativar ? 'Empresa reativada.' : 'Empresa desativada.');
      carregar();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível alterar o status da empresa.'));
    } finally {
      setAlterando(null);
    }
  };

  return (
    <section>
      <div className="adm-titulo-pagina">
        <h1>Empresas</h1>
        <p>Empresas cadastradas para publicar vagas.</p>
      </div>

      <div className="adm-filtros">
        <label className="adm-busca">
          <Search size={18} />
          <input
            type="search"
            placeholder="Buscar por razão social, CNPJ ou e-mail"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar por razão social, CNPJ ou e-mail"
          />
        </label>
        <div className={`adm-filtro-status ${status || 'todos'}`} ref={filtroStatusRef}>
          <span>Status da empresa</span>
          <button type="button" className="adm-filtro-status-gatilho" onClick={() => setMenuStatusAberto((aberto) => !aberto)} aria-haspopup="listbox" aria-expanded={menuStatusAberto}>
            {status === 'ativo' ? 'Somente ativas' : status === 'inativo' ? 'Somente desativadas' : 'Todas as empresas'}<ChevronDown size={17} aria-hidden="true" />
          </button>
          {menuStatusAberto && <div className="adm-filtro-status-opcoes" role="listbox" aria-label="Filtrar por status">
            {[['', 'Todas as empresas'], ['ativo', 'Somente ativas'], ['inativo', 'Somente desativadas']].map(([valor, rotulo]) => <button type="button" role="option" aria-selected={status === valor} key={valor || 'todas'} onClick={() => { setStatus(valor); setMenuStatusAberto(false); }}><span className={`adm-status-ponto ${valor || 'todas'}`} aria-hidden="true" />{rotulo}{status === valor && <Check size={16} aria-hidden="true" />}</button>)}
          </div>}
        </div>
      </div>

      <Aviso>{erro}</Aviso>
      <Aviso tipo="sucesso">{aviso}</Aviso>

      <div className="adm-tabela-wrapper">
        <table className="adm-tabela">
          <thead>
            <tr>
              <th>Razão social</th>
              <th>CNPJ</th>
              <th>E-mail</th>
              <th>Status</th>
              <th>Cadastro</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td colSpan="6" className="adm-vazio">Carregando...</td>
              </tr>
            )}
            {!carregando && resultado.itens.length === 0 && (
              <tr>
                <td colSpan="6" className="adm-vazio">Nenhuma empresa encontrada.</td>
              </tr>
            )}
            {!carregando &&
              resultado.itens.map((empresa) => (
                <tr key={empresa.id}>
                  <td data-label="Razão social">{empresa.razaoSocial || '—'}</td>
                  <td data-label="CNPJ">{formatarCnpj(empresa.cnpj)}</td>
                  <td data-label="E-mail">{empresa.email}</td>
                  <td data-label="Status"><StatusBadge ativo={empresa.ativo} /></td>
                  <td data-label="Cadastro">{formatarData(empresa.criadoEm)}</td>
                  <td className="adm-acoes">
                    <Link to={`/admin/empresas/${empresa.id}`} className="adm-botao adm-botao-secundario">
                      Detalhes
                    </Link>
                    <button
                      type="button"
                      className={`adm-botao ${empresa.ativo === false ? 'adm-botao-primario' : 'adm-botao-perigo'}`}
                      onClick={() => alternarStatus(empresa)}
                      disabled={alterando === empresa.id}
                    >
                      {alterando === empresa.id ? 'Salvando...' : empresa.ativo === false ? 'Reativar' : 'Desativar'}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Paginacao
        pagina={resultado.pagina}
        totalPaginas={resultado.totalPaginas}
        totalItens={resultado.totalItens}
        aoMudar={setPagina}
      />
    </section>
  );
}

export default AdminEmpresas;

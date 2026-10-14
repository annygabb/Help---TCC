import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { alterarStatusEmpresa, listarEmpresas, mensagemDeErro } from '../../services/adminService';
import { Aviso, Paginacao, StatusBadge, formatarCnpj, formatarData, useDebounce } from './adminComponentes';

const TAMANHO_PAGINA = 10;

function AdminEmpresas() {
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('');
  const [pagina, setPagina] = useState(0);
  const [resultado, setResultado] = useState({ itens: [], pagina: 0, totalPaginas: 0, totalItens: 0 });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [alterando, setAlterando] = useState(null);

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
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar por status">
          <option value="">Todos os status</option>
          <option value="ativo">Ativas</option>
          <option value="inativo">Desativadas</option>
        </select>
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

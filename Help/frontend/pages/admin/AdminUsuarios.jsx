import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { alterarStatusConta, listarContas, mensagemDeErro } from '../../services/adminService';
import { useContaAdmin } from './AdminRoute';
import { Aviso, Paginacao, StatusBadge, TipoBadge, formatarData, useDebounce } from './adminComponentes';

const TAMANHO_PAGINA = 10;

function AdminUsuarios() {
  const contaLogada = useContaAdmin();
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState('');
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
  }, [buscaAplicada, tipo, status]);

  const carregar = useCallback(() => {
    const requisicao = ++ultimaRequisicao.current;
    setCarregando(true);
    setErro('');
    listarContas({ busca: buscaAplicada, tipo, status, pagina, tamanho: TAMANHO_PAGINA })
      .then((dados) => {
        if (requisicao === ultimaRequisicao.current) setResultado(dados);
      })
      .catch((e) => {
        if (requisicao === ultimaRequisicao.current) setErro(mensagemDeErro(e, 'Não foi possível carregar as contas.'));
      })
      .finally(() => {
        if (requisicao === ultimaRequisicao.current) setCarregando(false);
      });
  }, [buscaAplicada, tipo, status, pagina]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const alternarStatus = async (conta) => {
    const ativar = conta.ativo === false;
    const confirmar = window.confirm(
      ativar ? `Reativar a conta de ${conta.nome}?` : `Desativar a conta de ${conta.nome}? A pessoa não conseguirá mais entrar.`
    );
    if (!confirmar) return;

    setAlterando(conta.id);
    setAviso('');
    setErro('');
    try {
      await alterarStatusConta(conta.id, ativar);
      setAviso(ativar ? 'Conta reativada.' : 'Conta desativada.');
      carregar();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível alterar o status da conta.'));
    } finally {
      setAlterando(null);
    }
  };

  return (
    <section>
      <div className="adm-titulo-pagina">
        <h1>Usuários</h1>
        <p>Contas de candidatos e de administradores.</p>
      </div>

      <div className="adm-filtros">
        <label className="adm-busca">
          <Search size={18} />
          <input
            type="search"
            placeholder="Buscar por nome ou e-mail"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar por nome ou e-mail"
          />
        </label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Filtrar por tipo">
          <option value="">Todos os tipos</option>
          <option value="CANDIDATO">Candidatos</option>
          <option value="ADMIN">Administradores</option>
        </select>
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
              <th>Nome</th>
              <th>E-mail</th>
              <th>Tipo</th>
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
                <td colSpan="6" className="adm-vazio">Nenhuma conta encontrada.</td>
              </tr>
            )}
            {!carregando &&
              resultado.itens.map((conta) => {
                const propriaConta = contaLogada?.id === conta.id;
                return (
                  <tr key={conta.id}>
                    <td data-label="Nome">{conta.nome || '—'}</td>
                    <td data-label="E-mail">{conta.email}</td>
                    <td data-label="Tipo"><TipoBadge tipo={conta.tipoConta} /></td>
                    <td data-label="Status"><StatusBadge ativo={conta.ativo} /></td>
                    <td data-label="Cadastro">{formatarData(conta.criadoEm)}</td>
                    <td className="adm-acoes">
                      <Link to={`/admin/usuarios/${conta.id}`} className="adm-botao adm-botao-secundario">
                        Detalhes
                      </Link>
                      <button
                        type="button"
                        className={`adm-botao ${conta.ativo === false ? 'adm-botao-primario' : 'adm-botao-perigo'}`}
                        onClick={() => alternarStatus(conta)}
                        disabled={propriaConta || alterando === conta.id}
                        title={propriaConta ? 'Você não pode desativar a própria conta.' : undefined}
                      >
                        {alterando === conta.id ? 'Salvando...' : conta.ativo === false ? 'Reativar' : 'Desativar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
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

export default AdminUsuarios;

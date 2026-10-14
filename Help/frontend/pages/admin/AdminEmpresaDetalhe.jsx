import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { alterarStatusEmpresa, buscarEmpresa, mensagemDeErro } from '../../services/adminService';
import { Aviso, StatusBadge, formatarCnpj, formatarData, formatarDataHora } from './adminComponentes';

function Campo({ rotulo, valor }) {
  return (
    <div className="adm-campo">
      <span>{rotulo}</span>
      <strong>{valor === null || valor === undefined || valor === '' ? '—' : valor}</strong>
    </div>
  );
}

function AdminEmpresaDetalhe() {
  const { id } = useParams();
  const [empresa, setEmpresa] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  const carregar = useCallback(() => {
    setCarregando(true);
    buscarEmpresa(id)
      .then(setEmpresa)
      .catch((e) => setErro(mensagemDeErro(e, 'Não foi possível carregar a empresa.')))
      .finally(() => setCarregando(false));
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const alternarStatus = async () => {
    const ativar = empresa.ativo === false;
    if (!window.confirm(ativar ? 'Reativar esta empresa?' : 'Desativar esta empresa? Ela não conseguirá mais entrar.')) return;

    setSalvando(true);
    setErro('');
    setAviso('');
    try {
      await alterarStatusEmpresa(empresa.id, ativar);
      setAviso(ativar ? 'Empresa reativada.' : 'Empresa desativada.');
      carregar();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível alterar o status da empresa.'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section>
      <Link to="/admin/empresas" className="adm-voltar">
        <ArrowLeft size={18} /> Voltar para empresas
      </Link>

      <Aviso>{erro}</Aviso>
      <Aviso tipo="sucesso">{aviso}</Aviso>

      {carregando && !empresa && <p className="adm-vazio">Carregando...</p>}

      {empresa && (
        <>
          <div className="adm-detalhe-topo">
            <div className="adm-avatar adm-avatar-grande">{(empresa.razaoSocial || '?').charAt(0).toUpperCase()}</div>
            <div className="adm-detalhe-identificacao">
              <h1>{empresa.razaoSocial || 'Sem razão social'}</h1>
              <span>{empresa.email}</span>
              <div className="adm-badges">
                <StatusBadge ativo={empresa.ativo} />
              </div>
            </div>
            <button
              type="button"
              className={`adm-botao ${empresa.ativo === false ? 'adm-botao-primario' : 'adm-botao-perigo'}`}
              onClick={alternarStatus}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : empresa.ativo === false ? 'Reativar empresa' : 'Desativar empresa'}
            </button>
          </div>

          <div className="adm-painel">
            <h2>Dados corporativos</h2>
            <Campo rotulo="Razão social" valor={empresa.razaoSocial} />
            <Campo rotulo="CNPJ" valor={formatarCnpj(empresa.cnpj)} />
            <Campo rotulo="E-mail" valor={empresa.email} />
            <Campo rotulo="Cadastro" valor={formatarData(empresa.criadoEm)} />
          </div>

          <div className="adm-painel">
            <h2>Histórico administrativo</h2>
            {!empresa.historico || empresa.historico.length === 0 ? (
              <p className="adm-texto-suave">Nenhuma ação administrativa registrada para esta empresa.</p>
            ) : (
              <ul className="adm-historico">
                {empresa.historico.map((item) => (
                  <li key={item.id || `${item.acao}-${item.dataHora}`}>
                    <strong>{item.acao}</strong>
                    <span>
                      {item.adminNome ? `por ${item.adminNome} · ` : ''}
                      {formatarDataHora(item.dataHora)}
                    </span>
                    {item.resumo && <p>{item.resumo}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default AdminEmpresaDetalhe;

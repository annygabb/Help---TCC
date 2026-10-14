import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { alterarStatusConta, buscarConta, mensagemDeErro } from '../../services/adminService';
import { useContaAdmin } from './AdminRoute';
import { Aviso, StatusBadge, TipoBadge, formatarData, formatarDataHora } from './adminComponentes';

function Campo({ rotulo, valor }) {
  return (
    <div className="adm-campo">
      <span>{rotulo}</span>
      <strong>{valor === null || valor === undefined || valor === '' ? '—' : valor}</strong>
    </div>
  );
}

function AdminUsuarioDetalhe() {
  const { id } = useParams();
  const contaLogada = useContaAdmin();
  const [conta, setConta] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  const carregar = useCallback(() => {
    setCarregando(true);
    buscarConta(id)
      .then(setConta)
      .catch((e) => setErro(mensagemDeErro(e, 'Não foi possível carregar a conta.')))
      .finally(() => setCarregando(false));
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const alternarStatus = async () => {
    const ativar = conta.ativo === false;
    if (!window.confirm(ativar ? 'Reativar esta conta?' : 'Desativar esta conta? A pessoa não conseguirá mais entrar.')) return;

    setSalvando(true);
    setErro('');
    setAviso('');
    try {
      await alterarStatusConta(conta.id, ativar);
      setAviso(ativar ? 'Conta reativada.' : 'Conta desativada.');
      carregar();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível alterar o status da conta.'));
    } finally {
      setSalvando(false);
    }
  };

  const propriaConta = contaLogada?.id === conta?.id;

  return (
    <section>
      <Link to="/admin/usuarios" className="adm-voltar">
        <ArrowLeft size={18} /> Voltar para usuários
      </Link>

      <Aviso>{erro}</Aviso>
      <Aviso tipo="sucesso">{aviso}</Aviso>

      {carregando && !conta && <p className="adm-vazio">Carregando...</p>}

      {conta && (
        <>
          <div className="adm-detalhe-topo">
            <div className="adm-avatar adm-avatar-grande">{(conta.nome || '?').charAt(0).toUpperCase()}</div>
            <div className="adm-detalhe-identificacao">
              <h1>{conta.nome || 'Sem nome'}</h1>
              <span>{conta.email}</span>
              <div className="adm-badges">
                <TipoBadge tipo={conta.tipoConta} />
                <StatusBadge ativo={conta.ativo} />
              </div>
            </div>
            <button
              type="button"
              className={`adm-botao ${conta.ativo === false ? 'adm-botao-primario' : 'adm-botao-perigo'}`}
              onClick={alternarStatus}
              disabled={salvando || propriaConta}
              title={propriaConta ? 'Você não pode desativar a própria conta.' : undefined}
            >
              {salvando ? 'Salvando...' : conta.ativo === false ? 'Reativar conta' : 'Desativar conta'}
            </button>
          </div>

          <div className="adm-paineis">
            <div className="adm-painel">
              <h2>Perfil</h2>
              <Campo rotulo="Cargo" valor={conta.cargo} />
              <Campo rotulo="Localização" valor={conta.localizacao} />
              <Campo rotulo="CPF" valor={conta.cpfMascarado} />
              <Campo rotulo="Cadastro" valor={formatarData(conta.criadoEm)} />
            </div>

            <div className="adm-painel">
              <h2>Conexões</h2>
              <Campo rotulo="Seguidores" valor={conta.seguidores} />
              <Campo rotulo="Seguindo" valor={conta.seguindo} />
            </div>
          </div>

          <div className="adm-painel">
            <h2>Histórico administrativo</h2>
            {!conta.historico || conta.historico.length === 0 ? (
              <p className="adm-texto-suave">Nenhuma ação administrativa registrada para esta conta.</p>
            ) : (
              <ul className="adm-historico">
                {conta.historico.map((item) => (
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

export default AdminUsuarioDetalhe;

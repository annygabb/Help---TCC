import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, ShieldCheck, Building2, UserX, Ban } from 'lucide-react';
import { buscarResumo, mensagemDeErro } from '../../services/adminService';
import { Aviso } from './adminComponentes';

const CARTOES = [
  { chave: 'totalContas', rotulo: 'Contas de pessoas', icone: Users },
  { chave: 'candidatos', rotulo: 'Candidatos', icone: UserCheck },
  { chave: 'administradores', rotulo: 'Administradores', icone: ShieldCheck },
  { chave: 'empresas', rotulo: 'Empresas', icone: Building2 },
  { chave: 'contasInativas', rotulo: 'Contas desativadas', icone: UserX },
  { chave: 'empresasInativas', rotulo: 'Empresas desativadas', icone: Ban },
];

function AdminHome() {
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    buscarResumo()
      .then(setResumo)
      .catch((e) => setErro(mensagemDeErro(e, 'Não foi possível carregar os números do painel.')))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <section>
      <div className="adm-titulo-pagina">
        <h1>Visão geral</h1>
        <p>Números atuais da plataforma, lidos direto do banco.</p>
      </div>

      <Aviso>{erro}</Aviso>

      <div className="adm-cartoes">
        {CARTOES.map(({ chave, rotulo, icone: Icone }) => (
          <div className="adm-cartao" key={chave}>
            <Icone size={22} className="adm-cartao-icone" />
            <span className="adm-cartao-rotulo">{rotulo}</span>
            <strong className="adm-cartao-valor">
              {carregando ? '...' : resumo?.[chave] ?? '—'}
            </strong>
          </div>
        ))}
      </div>

      <div className="adm-atalhos">
        <Link to="/admin/usuarios" className="adm-atalho">
          <Users size={20} />
          <div>
            <strong>Gerenciar usuários</strong>
            <span>Buscar, abrir detalhes e ativar ou desativar contas.</span>
          </div>
        </Link>
        <Link to="/admin/empresas" className="adm-atalho">
          <Building2 size={20} />
          <div>
            <strong>Gerenciar empresas</strong>
            <span>Consultar dados corporativos e o status de cada empresa.</span>
          </div>
        </Link>
      </div>
    </section>
  );
}

export default AdminHome;

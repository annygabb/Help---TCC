import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { estabelecerSessao } from '../../services/session';
import { CampoSenha } from '../../components/CampoSenha';
import logoImg from '../../assets/logo.png';
import '../Login.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const entrar = async (event) => {
    event.preventDefault(); setLoading(true); setErro('');
    try {
      const { data } = await api.post('/api/usuarios/login/admin', { email, password });
      if (!data?.token || data?.tipoConta !== 'ADMIN') throw new Error('Resposta administrativa inválida.');
      estabelecerSessao(data.token, { id: data.id, nome: data.nome, email: data.email, tipoConta: 'ADMIN' });
      navigate('/admin', { replace: true });
    } catch (error) {
      setErro(error.response?.status === 401 ? 'E-mail ou senha inválidos.' : 'Não foi possível acessar o painel administrativo.');
    } finally { setLoading(false); }
  };

  return <div className="container-login">
    <div className="card-login">
      <img src={logoImg} alt="Help" className="login-logo-img" style={{ height: 90, width: 'auto' }} />
      <ShieldCheck size={30} color="#a855f7" aria-hidden="true" />
      <h2 style={{ color: 'white' }}>Acesso administrativo</h2>
      <p style={{ color: '#a1a1aa', textAlign: 'center' }}>Área restrita à equipe autorizada.</p>
      {erro && <p role="alert" style={{ color: '#fca5a5', textAlign: 'center' }}>{erro}</p>}
      <form className="login-form" onSubmit={entrar}>
        <div className="input-container"><Mail size={20} color="#7c3aed" style={{ marginLeft: 15 }} /><input type="email" className="input-field" placeholder="E-mail administrativo" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" /></div>
        <CampoSenha wrapperClassName="input-container" inputClassName="input-field" iconStyle={{ marginLeft: 15 }} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        <button type="submit" className={`btn-entrar ${loading ? 'loading' : ''}`} disabled={loading}>{loading ? 'Verificando...' : 'Entrar no painel'}</button>
      </form>
    </div>
  </div>;
}

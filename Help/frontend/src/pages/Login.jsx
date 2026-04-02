import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowLeft } from 'lucide-react';

import api from '../services/api';
import './Login.css';
import logoImg from '../assets/logo.png';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dados = {
      email: email,
      password: password
    };

    try {
      const response = await api.post('/usuarios/login', dados);

      console.log("Resposta da API:", response.data);

      const { token, id, nome, email: userEmail } = response.data;

      if (token) {
        const usuarioParaSalvar = {
          token: token,
          id: id,
          nome: nome || '',
          email: userEmail,
          cargo: response.data.cargo || '',
          localidade: response.data.localidade || '',
          bio: response.data.bio || ''
        };

        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioParaSalvar));

        navigate('/feed');
      } else {
        alert("O servidor não retornou um token de acesso.");
      }

    } catch (error) {
      console.error("Erro na autenticação:", error);

      if (error.response) {
        const mensagemErro = error.response.data;

        if (error.response.status === 401) {
          alert(typeof mensagemErro === 'string' ? mensagemErro : "E-mail ou senha incorretos.");
        } else if (error.response.status === 403) {
          alert("Acesso negado. O filtro de segurança barrou a requisição.");
        } else {
          alert("Erro no servidor: " + (mensagemErro || "Tente novamente mais tarde."));
        }
      } else {
        alert("Não foi possível conectar ao servidor. Verifique se o Backend está rodando.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-login">
      <button
        className="back-btn"
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          zIndex: 10
        }}
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <div className="card-login">
        <img
          src={logoImg}
          alt="Help Logo"
          className="login-logo-img"
          style={{
            height: '100px',
            width: 'auto',
            objectFit: 'contain',
            marginBottom: '20px'
          }}
        />

        <h2 style={{ color: 'white', marginBottom: '20px', fontWeight: '600' }}>
          Entrar no Help
        </h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-container">
            <Mail size={20} color="#7c3aed" style={{ marginLeft: '15px' }} />
            <input
              type="email"
              placeholder="E-mail"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="input-container">
            <Lock size={20} color="#7c3aed" style={{ marginLeft: '15px' }} />
            <input
              type="password"
              placeholder="Senha"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div style={{ textAlign: 'right', width: '100%', marginBottom: '20px' }}>
            <Link
              to="/recuperar-senha"
              style={{ color: '#a855f7', textDecoration: 'none', fontSize: '14px' }}
            >
              Esqueceu a senha?
            </Link>
          </div>

          <button
            type="submit"
            className={`btn-entrar ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>

        <p className="footer-text" style={{ color: 'rgba(255,255,255,0.7)', marginTop: '20px' }}>
          Ainda não tem uma conta?{' '}
          <span
            onClick={() => navigate('/cadastro')}
            style={{ color: '#a855f7', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Cadastre-se
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
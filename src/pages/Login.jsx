import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Importação correta no topo
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import './Login.css';
import logoImg from '../assets/logo.png';

function Login() {
  const navigate = useNavigate();

  return (
    <div className="container-login">
      {/* Botão para voltar à Home */}
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
          gap: '5px'
        }}
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <div className="card-login">
        <img
          src={logoImg}
          alt="Help Logo"
          style={{
            height: '100px',
            width: 'auto',
            objectFit: 'contain',
            marginBottom: '20px'
          }}
        />

        <h2 style={{ color: 'white', marginBottom: '20px' }}>Entrar no Help</h2>

        <form className="login-form">
          <div className="input-container">
            <Mail size={20} color="#7c3aed" style={{ marginLeft: '15px' }} />
            <input
              type="email"
              placeholder="E-mail"
              className="input-field"
              required
            />
          </div>

          <div className="input-container">
            <Lock size={20} color="#7c3aed" style={{ marginLeft: '15px' }} />
            <input
              type="password"
              placeholder="Senha"
              className="input-field"
              required
            />
          </div>

          {/* Link de Esqueci a Senha corrigido */}
          <div style={{ textAlign: 'right', width: '100%', marginBottom: '20px' }}>
            <Link
              to="/recuperar-senha"
              style={{ color: '#a855f7', textDecoration: 'none', fontSize: '14px' }}
            >
              Esqueceu a senha?
            </Link>
          </div>

          <button type="submit" className="btn-entrar">
            Entrar
          </button>
        </form>

        <p className="footer-text">
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
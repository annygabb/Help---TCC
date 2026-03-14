import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Fingerprint } from 'lucide-react';
import './Cadastro.css';
import logoImg from '../assets/logo.png';

function Cadastro() {
  const navigate = useNavigate();

  return (
    <div className="background-container">
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

      <div className="cadastro-card">

        <img
          src={logoImg}
          alt="Help Logo"
          className="logo-image-auth"
          style={{
            height: '100px',
            width: 'auto',
            objectFit: 'contain',
            marginBottom: '20px' //
          }}
        />

        <h2 style={{ color: 'white', marginBottom: '20px', marginTop: '10px' }}>Criar Conta</h2>

        <form>
          <div className="input-with-icon">
            <User size={20} color="#7c3aed" />
            <input type="text" placeholder="Nome Completo" required />
          </div>

          <div className="input-with-icon">
            <Fingerprint size={20} color="#7c3aed" />
            <input
              type="text"
              placeholder="CPF (000.000.000-00)"
              maxLength="14"
              required
            />
          </div>

          <div className="input-with-icon">
            <Mail size={20} color="#7c3aed" />
            <input type="email" placeholder="E-mail" required />
          </div>

          <div className="input-with-icon">
            <Lock size={20} color="#7c3aed" />
            <input type="password" placeholder="Senha" required />
          </div>

          <button type="submit" className="btn-cadastro">
            Cadastrar
          </button>
        </form>

        <p className="footer-text">
          Já tem uma conta? <span onClick={() => navigate('/login')}>Fazer Login</span>
        </p>
      </div>
    </div>
  );
}

export default Cadastro;
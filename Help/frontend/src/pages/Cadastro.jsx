import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Fingerprint } from 'lucide-react';
import api from '../services/api';
import './Cadastro.css';
import logoImg from '../assets/logo.png';

function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dados = {
      name: nome,
      email: email,
      password: senha,
      cpf: cpf
    };

    try {
    await api.post('/usuarios/cadastro', dados);

      alert("Cadastro realizado com sucesso!");
      navigate('/login');
    } catch (error) {
      console.error("Erro ao realizar cadastro:", error);

      if (error.response?.status === 400) {
        alert("E-mail ou CPF já cadastrados no sistema.");
      } else {
        alert("Erro ao criar conta. Verifique a conexão com o servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

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
            marginBottom: '20px'
          }}
        />

        <h2 style={{ color: 'white', marginBottom: '20px', marginTop: '10px' }}>Criar Conta</h2>

        <form onSubmit={handleCadastro}>
          <div className="input-with-icon">
            <User size={20} color="#7c3aed" />
            <input
              type="text"
              placeholder="Nome Completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="input-with-icon">
            <Fingerprint size={20} color="#7c3aed" />
            <input
              type="text"
              placeholder="CPF (000.000.000-00)"
              maxLength="14"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
            />
          </div>

          <div className="input-with-icon">
            <Mail size={20} color="#7c3aed" />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-with-icon">
            <Lock size={20} color="#7c3aed" />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-cadastro" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="footer-text">
          Já tem uma conta? <span onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: '#a855f7', fontWeight: 'bold' }}>Fazer Login</span>
        </p>
      </div>
    </div>
  );
}

export default Cadastro;
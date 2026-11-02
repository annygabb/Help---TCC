import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, User, Fingerprint } from 'lucide-react';
import api from '../services/api';
import './Cadastro.css';
import logoImg from '../assets/logo.png';
import { apenasDigitos, formatarCPF, mensagemDaApi, senhaValida, validarCPF } from '../utils/validacoes';
import { CampoSenha, RequisitosSenha } from '../components/CampoSenha';

function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async (e) => {
    e.preventDefault();
    if (!validarCPF(cpf)) {
      alert('Informe um CPF válido.');
      return;
    }
    if (!senhaValida(senha)) {
      alert('A senha precisa ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula e um número.');
      return;
    }
    setLoading(true);

    const dados = {
      name: nome,
      email: email,
      password: senha,
      cpf: apenasDigitos(cpf)
    };

    try {
      await api.post('/api/usuarios/cadastrar', dados);

      alert("Cadastro realizado com sucesso!");
      navigate('/login');
    } catch (error) {
      console.error("Erro ao realizar cadastro:", error);

      alert(mensagemDaApi(error, 'Erro ao criar conta. Verifique a conexão com o servidor.'));
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
            display: 'block',
            height: '100px',
            width: 'auto',
            objectFit: 'contain',
            margin: '0 auto 20px'
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
              onChange={(e) => setCpf(formatarCPF(e.target.value))}
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

          <CampoSenha
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            autoComplete="new-password"
            aria-describedby="requisitos-senha-cadastro"
          />
          <RequisitosSenha senha={senha} id="requisitos-senha-cadastro" />

          <button
            type="submit"
            className="btn-cadastro"
            disabled={loading || !senhaValida(senha)}
            style={loading || !senhaValida(senha) ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
          >
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
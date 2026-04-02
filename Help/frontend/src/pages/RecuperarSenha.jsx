import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Lock, Key } from 'lucide-react';
import './Login.css';
import logoImg from '../assets/logo.png';

function RecuperarSenha() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [etapa, setEtapa] = useState(1); // 1:vai pedir código e 2: Redefinir senha
  const [carregando, setCarregando] = useState(false);

  const handlePedirCodigo = async (e) => {
    e.preventDefault();
    setCarregando(true);
    try {
      const response = await fetch(`http://localhost:8080/usuarios/gerar-token?email=${email}`, {
        method: 'POST'
      });

      if (response.ok) {
        setEtapa(2);
      } else {
        alert("Erro: Verifique se o e-mail está correto.");
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    setCarregando(true);
    try {
      const response = await fetch(`http://localhost:8080/usuarios/redefinir-senha?token=${token}&novaSenha=${novaSenha}`, {
        method: 'POST'
      });

      if (response.ok) {
        setEtapa(3);
      } else {
        alert("Token inválido ou expirado.");
      }
    } catch (error) {
      alert("Erro ao redefinir senha.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container-login">
      <button className="back-btn" onClick={() => navigate('/login')} style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <ArrowLeft size={20} /> Voltar ao Login
      </button>

      <div className="card-login">
        <img src={logoImg} alt="Help Logo" style={{ height: '100px', width: 'auto', marginBottom: '20px' }} />

        {etapa === 1 && (
          <>
            <h2 style={{ color: 'white', marginBottom: '10px' }}>Esqueceu a senha?</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '25px', fontSize: '14px', textAlign: 'center' }}>
              Enviaremos um código de verificação para o seu e-mail.
            </p>
            <form className="login-form" onSubmit={handlePedirCodigo}>
              <div className="input-container">
                <Mail size={20} color="#7c3aed" style={{ marginLeft: '15px' }} />
                <input
                  type="email"
                  placeholder="Seu e-mail cadastrado"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-entrar" disabled={carregando}>
                {carregando ? "Enviando..." : "Enviar Código"}
              </button>
            </form>
          </>
        )}

        {etapa === 2 && (
          <>
            <h2 style={{ color: 'white', marginBottom: '10px' }}>Criar Nova Senha</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '25px', fontSize: '14px', textAlign: 'center' }}>
              Insira o código enviado ao seu e-mail e a nova senha desejada.
            </p>
            <form className="login-form" onSubmit={handleRedefinirSenha}>
              <div className="input-container">
                <Key size={20} color="#7c3aed" style={{ marginLeft: '15px' }} />
                <input
                  type="text"
                  placeholder="Cole o código do e-mail"
                  className="input-field"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>
              <div className="input-container" style={{ marginTop: '10px' }}>
                <Lock size={20} color="#7c3aed" style={{ marginLeft: '15px' }} />
                <input
                  type="password"
                  placeholder="Nova senha"
                  className="input-field"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-entrar" disabled={carregando}>
                {carregando ? "Processando..." : "Redefinir Senha"}
              </button>
            </form>
          </>
        )}

        {etapa === 3 && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <CheckCircle size={60} color="#22c55e" style={{ marginBottom: '20px' }} />
            <h2 style={{ color: 'white', marginBottom: '10px' }}>Sucesso!</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '25px', fontSize: '14px' }}>
              Sua senha foi atualizada com sucesso.
            </p>
            <button className="btn-entrar" onClick={() => navigate('/login')}>
              Fazer Login Agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecuperarSenha;
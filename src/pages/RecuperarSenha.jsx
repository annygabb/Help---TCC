import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import './Login.css'; // Reutilizando seus estilos de Login
import logoImg from '../assets/logo.png';

function RecuperarSenha() {
  const navigate = useNavigate();
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui entraria a lógica de integração com o backend
    setEnviado(true);
  };

  return (
    <div className="container-login">
      <button
        className="back-btn"
        onClick={() => navigate('/login')}
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
        <ArrowLeft size={20} /> Voltar ao Login
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

        {!enviado ? (
          <>
            <h2 style={{ color: 'white', marginBottom: '10px' }}>Recuperar Senha</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '25px', fontSize: '14px', textAlign: 'center' }}>
              Informe seu e-mail cadastrado e enviaremos as instruções para redefinir sua senha.
            </p>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-container">
                <Mail size={20} color="#7c3aed" style={{ marginLeft: '15px' }} />
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="input-field"
                  required
                />
              </div>

              <button type="submit" className="btn-entrar" style={{ marginTop: '10px' }}>
                Enviar Link de Recuperação
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <CheckCircle size={60} color="#a855f7" style={{ marginBottom: '20px' }} />
            <h2 style={{ color: 'white', marginBottom: '10px' }}>E-mail Enviado!</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '25px', fontSize: '14px' }}>
              Se este e-mail estiver cadastrado, você receberá um link em instantes.
            </p>
            <button
              className="btn-entrar"
              onClick={() => navigate('/login')}
            >
              Voltar para Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecuperarSenha;
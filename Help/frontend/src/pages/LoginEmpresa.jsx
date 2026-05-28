import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import api from '../services/api';
import './LoginEmpresa.css';
import logoImg from '../assets/logo.png';

function LoginEmpresa() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const dados = {
            email: email,
            password: senha
        };

        try {
            const response = await api.post('/empresas/login', dados);

            localStorage.setItem('token', response.data.token);

            alert("Login realizado com sucesso!");
            navigate('/dashboard-rh');
        } catch (error) {
            console.error("Erro ao realizar login:", error);
            if (error.response?.status === 401) {
                alert("E-mail ou senha incorretos.");
            } else {
                alert("Erro ao conectar com o servidor. Tente novamente mais tarde.");
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
                    gap: '5px',
                    transition: 'color 0.3s'
                }}
            >
                <ArrowLeft size={20} /> Voltar
            </button>

            <div className="login-card">
                <img
                    src={logoImg}
                    alt="Help Logo"
                    className="logo-image-auth"
                    style={{
                        height: '100px',
                        width: 'auto',
                        objectFit: 'contain',
                        marginBottom: '10px'
                    }}
                />

                <div className="logo-subtext">Corporativo</div>

                <h2 style={{ color: 'white', marginBottom: '20px', marginTop: '10px' }}>Entrar na Conta</h2>

                <form onSubmit={handleLogin}>
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

                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <p className="footer-text">
                    Não tem uma conta? <span onClick={() => navigate('/cadastro-empresa')}>Cadastre sua Empresa</span>
                </p>
            </div>
        </div>
    );
}

export default LoginEmpresa;

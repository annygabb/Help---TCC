import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Building, FileText } from 'lucide-react';
import api from '../services/api';
import './CadastroEmpresa.css';
import logoImg from '../assets/logo.png';

function CadastroEmpresa() {
    const navigate = useNavigate();

    const [razaoSocial, setRazaoSocial] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCadastro = async (e) => {
        e.preventDefault();
        setLoading(true);

        const dados = {
            corporateName: razaoSocial,
            email: email,
            password: senha,
            cnpj: cnpj
        };

        try {
            await api.post('/empresas/cadastro', dados);
            alert("Cadastro de empresa realizado com sucesso!");
            navigate('/login-empresa');
        } catch (error) {
            console.error("Erro ao realizar cadastro:", error);
            if (error.response?.status === 400) {
                alert("E-mail ou CNPJ já cadastrados no sistema.");
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
                    gap: '5px',
                    transition: 'color 0.3s'
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
                        marginBottom: '10px'
                    }}
                />

                <div className="logo-subtext">Corporativo</div>

                <h2 style={{ color: 'white', marginBottom: '20px', marginTop: '10px' }}>Criar Conta</h2>

                <form onSubmit={handleCadastro}>
                    <div className="input-with-icon">
                        <Building size={20} color="#7c3aed" />
                        <input
                            type="text"
                            placeholder="Razão Social"
                            value={razaoSocial}
                            onChange={(e) => setRazaoSocial(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-with-icon">
                        <FileText size={20} color="#7c3aed" />
                        <input
                            type="text"
                            placeholder="CNPJ (00.000.000/0001-00)"
                            maxLength="14"
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-with-icon">
                        <Mail size={20} color="#7c3aed" />
                        <input
                            type="email"
                            placeholder="E-mail Corporativo"
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
                        {loading ? 'Cadastrando...' : 'Cadastrar Empresa'}
                    </button>
                </form>

                <p className="footer-text">
                    Já tem uma conta? <span onClick={() => navigate('/login-empresa')}>Fazer Login</span>
                </p>
            </div>
        </div>
    );
}

export default CadastroEmpresa;


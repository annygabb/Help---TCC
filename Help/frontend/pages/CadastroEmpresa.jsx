import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Building, FileText } from 'lucide-react';
import api from '../services/api';
import './CadastroEmpresa.css';
import logoImg from '../assets/logo.png';
import { senhaValida } from '../utils/validacoes';
import { CampoSenha, RequisitosSenha } from '../components/CampoSenha';

function CadastroEmpresa() {
    const navigate = useNavigate();

    const [razaoSocial, setRazaoSocial] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const handleCnpjChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length <= 14) {
            value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
            setCnpj(value);
        }
    };

    const handleCadastro = async (e) => {
        e.preventDefault();
        if (!senhaValida(senha)) {
            alert('A senha precisa ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula e um número.');
            return;
        }
        setLoading(true);

        const cnpjLimpo = cnpj.replace(/\D/g, '');

        const dados = {
            corporateName: razaoSocial,
            email: email,
            password: senha,
            cnpj: cnpjLimpo
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
                        height: '85px',
                        width: 'auto',
                        display: 'block',
                        margin: '0 auto 5px auto',
                        objectFit: 'contain'
                    }}
                />

                <div className="logo-subtext" style={{ textAlign: 'center', width: '100%' }}>
                    Corporativo
                </div>

                <h2 style={{ color: 'white', marginBottom: '20px', marginTop: '15px', textAlign: 'center' }}>
                    Criar Conta
                </h2>

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
                            maxLength="18"
                            value={cnpj}
                            onChange={handleCnpjChange}
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

                    <CampoSenha
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        autoComplete="new-password"
                        aria-describedby="requisitos-senha-empresa"
                    />
                    <RequisitosSenha senha={senha} id="requisitos-senha-empresa" />

                    <button
                        type="submit"
                        className="btn-cadastro"
                        disabled={loading || !senhaValida(senha)}
                        style={loading || !senhaValida(senha) ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                    >
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
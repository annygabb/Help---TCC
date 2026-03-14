import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, BookOpen, Briefcase, MessageSquare, Bell, Search, User, Mail, MapPin, Save } from 'lucide-react';
import './ConfigPerfil.css';
import logoImg from '../assets/logo.png';
import api from '../services/api'; // Importação da sua instância do Axios

const ConfigPerfil = () => {
  const navigate = useNavigate();

  // Função para salvar os dados no Backend (Spring Boot)
  const handleSave = async (e) => {
    e.preventDefault();

    // Captura todos os dados dos inputs através do atributo 'name'
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      // Faz a chamada PUT para o seu backend
      // Certifique-se de que a rota no Java seja exatamente esta ou altere abaixo
      await api.put('/usuarios/perfil', data);

      alert("Perfil atualizado com sucesso!");
      console.log("Dados enviados:", data);
    } catch (error) {
      console.error("Erro ao salvar no servidor:", error);
      alert("Houve um erro ao conectar com o servidor. Verifique se o backend está rodando.");
    }
  };

  return (
    <div className="config-container">
      {/* HEADER INTEGRADO */}
      <nav className="user-header">
        <div className="header-inner">
          <div className="header-left">
            <img
              src={logoImg}
              alt="Help Logo"
              className="header-logo"
              onClick={() => navigate('/feed')}
              style={{ cursor: 'pointer' }}
            />
            <div className="search-bar">
              <Search size={18} color="#9ca3af" />
              <input type="text" placeholder="Pesquisar..." />
            </div>
          </div>

          <div className="header-right-nav">
            <div className="nav-item" onClick={() => navigate('/feed')}>
              <Home size={22} />
              <span>Início</span>
            </div>
            <div className="nav-item">
              <BookOpen size={22} />
              <span>Cursos</span>
            </div>
            <div className="nav-item">
              <Briefcase size={22} />
              <span>Vagas</span>
            </div>
            <div className="nav-item">
              <MessageSquare size={22} />
              <span>Mensagens</span>
            </div>
            <div className="nav-item">
              <Bell size={22} />
              <span>Notificações</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="config-main">
        <div className="glass-card config-card">
          {/* SEÇÃO DE FOTO */}
          <section className="profile-photo-section">
            <div className="avatar-preview"></div>
            <button className="change-photo-btn" type="button">Alterar foto de perfil</button>
          </section>

          {/* FORMULÁRIO CONECTADO */}
          <form className="config-form" onSubmit={handleSave}>
            <div className="input-group full-width">
              <label htmlFor="full_name"><User size={18} /> Nome Completo</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                defaultValue="Anny Gabrielly Gonçalves de Oliveira"
                autoComplete="name"
              />
            </div>

            <div className="input-group full-width">
              <label htmlFor="job_role"><Briefcase size={18} /> Título Profissional</label>
              <input
                type="text"
                id="job_role"
                name="job_role"
                defaultValue="Cursando Engenharia de Software | Java | HTML | CSS | PostgreSQL | UX/UI | Service Now | Metodologias Ágeis | Suporte de TI"
              />
            </div>

            <div className="input-group">
              <label htmlFor="user_email"><Mail size={18} /> E-mail Profissional</label>
              <input
                type="email"
                id="user_email"
                name="user_email"
                placeholder="seuemail@exemplo.com"
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label htmlFor="user_location"><MapPin size={18} /> Localização</label>
              <input
                type="text"
                id="user_location"
                name="user_location"
                defaultValue="Silvânia, Goiás, Brasil"
                autoComplete="address-level2"
              />
            </div>

            <div className="input-group full-width">
              <label htmlFor="user_bio">Sobre (Resumo Profissional)</label>
              <textarea
                id="user_bio"
                name="user_bio"
                placeholder="Conte um pouco sobre sua trajetória profissional..."
                autoComplete="off"
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                <Save size={20} /> Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ConfigPerfil;
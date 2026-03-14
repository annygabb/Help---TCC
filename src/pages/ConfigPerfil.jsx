import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, MessageSquare, Bell, Search,
  User, Mail, MapPin, Save, Building2, Calendar, AlignLeft
} from 'lucide-react';
import './ConfigPerfil.css';
import logoImg from '../assets/logo.png';
import api from '../services/api';

const ConfigPerfil = () => {
  const navigate = useNavigate();
  const [trabalhaAtualmente, setTrabalhaAtualmente] = useState(true);

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    data.trabalha_atualmente = trabalhaAtualmente;

    try {
      await api.put('/usuarios/perfil', data);
      alert("Perfil atualizado com sucesso!");
      navigate('/feed');
    } catch (error) {
      console.error("Erro ao salvar no servidor:", error);
      alert("Erro ao conectar com o servidor. Verifique o backend.");
    }
  };

  return (
    <div className="config-container">
      <nav className="user-header">
        <div className="header-inner">
          <div className="header-left">
            <img src={logoImg} alt="Help Logo" className="header-logo" onClick={() => navigate('/feed')} />
            <div className="search-bar">
              <Search size={18} color="#9ca3af" />
              <input type="text" placeholder="Pesquisar..." />
            </div>
          </div>
          <div className="header-right-nav">
            <div className="nav-item" onClick={() => navigate('/feed')}><Home size={22} /><span>Início</span></div>
            <div className="nav-item"><BookOpen size={22} /><span>Cursos</span></div>
            <div className="nav-item"><Briefcase size={22} /><span>Vagas</span></div>
            <div className="nav-item"><MessageSquare size={22} /><span>Mensagens</span></div>
            <div className="nav-item"><Bell size={22} /><span>Notificações</span></div>
          </div>
        </div>
      </nav>

      <main className="config-main">
        <div className="glass-card config-card profile-card-dark">
          <section className="profile-photo-section">
            <div className="avatar-preview"></div>
            <button className="change-photo-btn" type="button">Alterar foto de perfil</button>
          </section>

          <form className="config-form" onSubmit={handleSave}>
            <div className="input-group full-width">
              <label htmlFor="full_name"><User size={18} /> Nome Completo</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                defaultValue="Anny Gabrielly Gonçalves de Oliveira"
              />
            </div>

            <div className="input-group full-width">
              <label htmlFor="job_role"><AlignLeft size={18} /> Título Profissional (Bio)</label>
              <textarea
                id="job_role"
                name="job_role"
                className="bio-textarea"
                defaultValue="Cursando Engenharia de Software | Java | HTML | CSS | PostgreSQL | UX/UI | Service Now | Metodologias Ágeis | Suporte de TI"
                rows="3"
              ></textarea>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="user_email"><Mail size={18} /> E-mail Profissional</label>
                <input type="email" id="user_email" name="user_email" placeholder="seuemail@exemplo.com" />
              </div>
              <div className="input-group">
                <label htmlFor="user_location"><MapPin size={18} /> Localização</label>
                <input
                  type="text"
                  id="user_location"
                  name="user_location"
                  defaultValue="Silvânia, Goiás, Brasil"
                />
              </div>
            </div>

            <div className="input-group full-width">
              <label htmlFor="user_bio">Sobre (Resumo Profissional)</label>
              <textarea
                id="user_bio"
                name="user_bio"
                placeholder="Conte um pouco sobre sua trajetória profissional..."
                rows="5"
              ></textarea>
            </div>

            <hr className="divider" />

            <h3 className="section-title">Experiência Profissional</h3>

            <div className="input-group full-width">
              <label htmlFor="company_name"><Building2 size={18} /> Empresa</label>
              <input type="text" id="company_name" name="company_name" defaultValue="NTT DATA" />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="current_position">Cargo atual</label>
                <input type="text" id="current_position" name="current_position" defaultValue="Systems Analyst" />
              </div>
              <div className="input-group">
                <label htmlFor="employment_type">Tipo de emprego</label>
                <select id="employment_type" name="employment_type" defaultValue="integral">
                  <option value="integral">Tempo integral</option>
                  <option value="meio-periodo">Meio período</option>
                  <option value="estagio">Estágio</option>
                  <option value="freelance">Freelance/PJ</option>
                </select>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="company_location">Localidade da empresa</label>
                <input type="text" id="company_location" name="company_location" defaultValue="Brasília, DF" />
              </div>
              <div className="input-group">
                <label htmlFor="work_model">Modelo de trabalho</label>
                <select id="work_model" name="work_model" defaultValue="home-office">
                  <option value="presencial">Presencial</option>
                  <option value="hibrido">Híbrido</option>
                  <option value="home-office">Home Office</option>
                </select>
              </div>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="is_current"
                checked={trabalhaAtualmente}
                onChange={(e) => setTrabalhaAtualmente(e.target.checked)}
              />
              <label htmlFor="is_current">Trabalho atualmente nesta empresa</label>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="start_date"><Calendar size={18} /> Data de início</label>
                <input
                  type="month"
                  id="start_date"
                  name="start_date"
                  className="calendar-input"
                />
              </div>

              {!trabalhaAtualmente && (
                <div className="input-group">
                  <label htmlFor="end_date"><Calendar size={18} /> Data de finalização</label>
                  <input
                    type="month"
                    id="end_date"
                    name="end_date"
                    className="calendar-input"
                  />
                </div>
              )}
            </div>

            <div className="input-group full-width">
              <label htmlFor="job_description">Descrição das atividades</label>
              <textarea
                id="job_description"
                name="job_description"
                rows="4"
                placeholder="Descreva o que você faz no dia a dia..."
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
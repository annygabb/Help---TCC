import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, Search, MessageSquare, Bell, Plus,
  User, Mail, MapPin, Save, Building2, AlignLeft, FileText, Trash2,
  Camera, Calendar, GraduationCap, Clock, FileUp, CheckCircle, Pencil, X
} from 'lucide-react';

import './ConfigPerfil.css';
import logoImg from '../assets/logo.png';
import logoImgperfil from '../assets/fotoperfil.png';
import api from '../services/api';

const ConfigPerfil = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState({
    id: '',
    nome: '',
    cargo: '',
    localidade: '',
    email: '',
    bio: '',
    token: '',
    fotoPerfil: null
  });

  const [experiencias, setExperiencias] = useState([]);
  const [cursos, setCursos] = useState([]);

  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('usuarioLogado');

    if (savedUser) {
      const parsed = JSON.parse(savedUser);

      if (parsed && (parsed.id || parsed.idUsuario)) {
        setUserData({
          id: parsed.id || parsed.idUsuario || '',
          nome: parsed.nome || '',
          cargo: parsed.cargo || '',
          localidade: parsed.localidade || '',
          email: parsed.email || '',
          bio: parsed.bio || '',
          token: parsed.token || '',
          fotoPerfil: parsed.fotoPerfil || null
        });
      }

      if (parsed.experiencias) setExperiencias(parsed.experiencias);
      if (parsed.cursos) setCursos(parsed.cursos);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({ ...prev, fotoPerfil: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const adicionarExperiencia = () => {
    setExperiencias([...experiencias, {
      id: Date.now(),
      empresa: '',
      cargo: '',
      tipoEmprego: 'integral',
      modeloTrabalho: 'home-office',
      atividades: '',
      trabalhaAtualmente: false,
      dataInicio: '',
      dataFim: ''
    }]);
  };

  const removerExperiencia = (id) => {
    setExperiencias(experiencias.filter(exp => exp.id !== id));
  };

  const handleExpChange = (id, campo, valor) => {
    setExperiencias(experiencias.map(exp =>
      exp.id === id ? { ...exp, [campo]: valor } : exp
    ));
  };

  const adicionarCurso = () => {
    setCursos([...cursos, {
      id: Date.now(),
      nomeCurso: '',
      instituicao: '',
      cargaHoraria: '',
      tempoDuracao: '',
      certificadoPdf: null,
      nomeArquivo: ''
    }]);
  };

  const removerCurso = (id) => {
    setCursos(cursos.filter(c => c.id !== id));
  };

  const handleCursoChange = (id, campo, valor) => {
    setCursos(cursos.map(c => c.id === id ? { ...c, [campo]: valor } : c));
  };

  const handleCertificadoUpload = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCursos(cursos.map(c =>
          c.id === id ? { ...c, certificadoPdf: reader.result, nomeArquivo: file.name } : c
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!userData.id || userData.id === 'undefined') {
      alert("Erro técnico: Sessão inválida.");
      navigate('/login');
      return;
    }

    const payload = {
      ...userData,
      experiencias,
      cursos
    };

    try {
      await api.put(`/usuarios/${userData.id}`, payload, {
        headers: { Authorization: `Bearer ${userData.token}` }
      });

      localStorage.setItem('usuarioLogado', JSON.stringify(payload));
      alert("Perfil atualizado com sucesso!");
      navigate('/feed');
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Não foi possível salvar as alterações.");
    }
  };

  return (
    <div className="config-container">
      <nav className="user-header">
        <div className="header-inner">
          <div className="header-left">
            <img src={logoImg} alt="Help Logo" className="header-logo" onClick={() => navigate('/feed')} />
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Pesquisar profissionais..." />
            </div>
          </div>

          <div className="header-right-nav">
            <div className="nav-item" onClick={() => navigate('/feed')}><Home size={24} /><span>Início</span></div>
            <div className="nav-item" onClick={() => navigate('/cursos')}><BookOpen size={24} /><span>Cursos</span></div>
            <div className="nav-item" onClick={() => navigate('/vagas')}><Briefcase size={24} /><span>Vagas</span></div>
            <div className="nav-item" onClick={() => navigate('/mensagens')}><MessageSquare size={24} /><span>Mensagens</span></div>
            <div className="nav-item" onClick={() => navigate('/notificacoes')}><Bell size={24} /><span>Notificações</span></div>
          </div>
        </div>
      </nav>

      <main className="config-main">
        <div className="profile-card-dark">
          <section className="profile-photo-section">
            <div className="avatar-preview-medium">
              <img src={userData.fotoPerfil || logoImgperfil} alt="Perfil" />
            </div>
            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" style={{ display: 'none' }} />
            <button type="button" className="change-photo-btn-styled" onClick={() => fileInputRef.current.click()}>
              <Camera size={18} /> Alterar foto de perfil
            </button>
          </section>

          <form className="config-form" onSubmit={handleSave}>
            <div className="form-section">
              <h3 className="section-title"><User size={20} /> Informações Pessoais</h3>
              <div className="input-group full-width spacer-bottom">
                <label className="label-white">Nome Completo</label>
                <input
                  type="text"
                  value={userData.nome || ""}
                  onChange={(e) => setUserData({...userData, nome: e.target.value})}
                  placeholder="Seu nome profissional"
                />
              </div>

              <div className="input-row spacer-bottom">
                <div className="input-group">
                  <label className="label-white"><Mail size={18} /> E-mail de Contato</label>
                  <input
                    type="email"
                    value={userData.email || ""}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label className="label-white"><MapPin size={18} /> Localização</label>
                  <input
                    type="text"
                    value={userData.localidade || ""}
                    onChange={(e) => setUserData({...userData, localidade: e.target.value})}
                    placeholder="Cidade, Estado"
                  />
                </div>
              </div>

              <div className="input-group full-width">
                <label className="label-white">Sobre você (Resumo Profissional)</label>
                <textarea
                  value={userData.bio || ""}
                  onChange={(e) => setUserData({...userData, bio: e.target.value})}
                  rows="4"
                  placeholder="Conte sua trajetória..."
                />
              </div>
            </div>

            <hr className="divider" />

            <div className="form-section">
              <h3 className="section-title"><Briefcase size={20} /> Experiência Profissional</h3>

              {experiencias.map((exp, index) => (
                <div key={exp.id} className="experience-block-consistent block-spacer">
                  <div className="exp-header-styled">
                    <span className="exp-number-pill">Ocupação #{index + 1}</span>
                    <button type="button" className="remove-exp-btn-minimal" onClick={() => removerExperiencia(exp.id)}>
                      <Trash2 size={16} /> Remover
                    </button>
                  </div>

                  <div className="input-row spacer-bottom">
                    <div className="input-group">
                      <label className="label-white"><Building2 size={18} /> Empresa</label>
                      <input type="text" value={exp.empresa} onChange={(e) => handleExpChange(exp.id, 'empresa', e.target.value)} />
                    </div>
                    <div className="input-group">
                      <label className="label-white"><AlignLeft size={18} /> Cargo</label>
                      <input type="text" value={exp.cargo} onChange={(e) => handleExpChange(exp.id, 'cargo', e.target.value)} />
                    </div>
                  </div>

                  <div className="input-row spacer-bottom">
                    <div className="input-group full-width">
                       <div className="checkbox-group-styled">
                          <input
                            type="checkbox"
                            id={`current-${exp.id}`}
                            checked={exp.trabalhaAtualmente}
                            onChange={(e) => handleExpChange(exp.id, 'trabalhaAtualmente', e.target.checked)}
                          />
                          <label htmlFor={`current-${exp.id}`} className="label-white" style={{marginLeft: '10px'}}>Trabalho atualmente neste cargo</label>
                       </div>
                    </div>

                    <div className="input-group">
                      <label className="label-white"><Calendar size={18} /> Data de Início</label>
                      <input
                        type="date"
                        value={exp.dataInicio}
                        onChange={(e) => handleExpChange(exp.id, 'dataInicio', e.target.value)}
                      />
                    </div>

                    {!exp.trabalhaAtualmente && (
                      <div className="input-group">
                        <label className="label-white"><Calendar size={18} /> Data de Término</label>
                        <input
                          type="date"
                          value={exp.dataFim}
                          onChange={(e) => handleExpChange(exp.id, 'dataFim', e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="input-group full-width">
                    <label className="label-white"><FileText size={18} /> Descrição das Atividades</label>
                    <textarea value={exp.atividades} onChange={(e) => handleExpChange(exp.id, 'atividades', e.target.value)} rows="3" />
                  </div>
                </div>
              ))}

              <button type="button" className="add-experience-btn" onClick={adicionarExperiencia}>
                <Plus size={18} /> Adicionar experiência profissional
              </button>
            </div>

            <hr className="divider" />

            <div className="form-section">
              <h3 className="section-title"><GraduationCap size={20} /> Cursos e Certificações</h3>

              {cursos.map((curso, index) => (
                <div key={curso.id} className="experience-block-consistent block-spacer">
                  <div className="exp-header-styled">
                    <span className="exp-number-pill pill-purple">Curso #{index + 1}</span>
                    <button type="button" className="remove-exp-btn-minimal" onClick={() => removerCurso(curso.id)}>
                      <Trash2 size={16} /> Remover
                    </button>
                  </div>

                  <div className="input-row spacer-bottom">
                    <div className="input-group">
                      <label className="label-white">Nome do Curso</label>
                      <input type="text" value={curso.nomeCurso} onChange={(e) => handleCursoChange(curso.id, 'nomeCurso', e.target.value)} placeholder="Ex: Java Spring Boot" />
                    </div>
                    <div className="input-group">
                      <label className="label-white"><Building2 size={18} /> Instituição</label>
                      <input type="text" value={curso.instituicao} onChange={(e) => handleCursoChange(curso.id, 'instituicao', e.target.value)} placeholder="Ex: UniEVANGÉLICA" />
                    </div>
                  </div>

                  <div className="input-row spacer-bottom">
                    <div className="input-group">
                      <label className="label-white"><Clock size={18} /> Tempo / Duração</label>
                      <input type="text" value={curso.tempoDuracao} onChange={(e) => handleCursoChange(curso.id, 'tempoDuracao', e.target.value)} placeholder="Ex: 6 meses" />
                    </div>
                    <div className="input-group">
                      <label className="label-white"><FileText size={18} /> Carga Horária</label>
                      <input type="text" value={curso.cargaHoraria} onChange={(e) => handleCursoChange(curso.id, 'cargaHoraria', e.target.value)} placeholder="Ex: 40h" />
                    </div>
                  </div>

                  <div className="input-group full-width">
                    <label className="label-white"><FileUp size={18} /> Certificado (PDF ou Imagem)</label>
                    <div className="upload-container-centered">
                      {!curso.certificadoPdf ? (
                        <>
                          <label htmlFor={`cert-upload-${curso.id}`} className="custom-upload-label">
                            <Plus size={20} /> Adicionar Certificado
                          </label>
                          <span className="file-status-none">Nenhum arquivo escolhido</span>
                        </>
                      ) : (
                        <div className="file-attached-container">
                          <div
                            className="file-info-box"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setPreviewFile(curso.certificadoPdf)}
                          >
                            <CheckCircle size={20} className="text-purple" />
                            <span className="file-name-display">{curso.nomeArquivo || 'Certificado Anexado'}</span>
                          </div>

                          <div className="file-actions-overlay">
                            <label htmlFor={`cert-upload-${curso.id}`} className="action-icon-btn edit" title="Trocar arquivo">
                              <Pencil size={18} />
                            </label>
                            <button
                              type="button"
                              className="action-icon-btn delete"
                              onClick={() => handleCursoChange(curso.id, 'certificadoPdf', null)}
                              title="Remover"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      )}

                      <input
                        id={`cert-upload-${curso.id}`}
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => handleCertificadoUpload(curso.id, e)}
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className="add-experience-btn" onClick={adicionarCurso}>
                <Plus size={18} /> Adicionar curso
              </button>
            </div>

            <div className="form-actions mt-20">
              <button type="submit" className="save-btn"><Save size={20} /> Salvar Alterações</button>
            </div>
          </form>
        </div>
      </main>

      {previewFile && (
        <div className="modal-overlay" onClick={() => setPreviewFile(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPreviewFile(null)}>
              <X size={24} />
            </button>

            <div className="preview-container">
              {previewFile.includes("application/pdf") ? (
                <iframe src={previewFile} title="PDF Preview" width="100%" height="600px" />
              ) : (
                <img src={previewFile} alt="Preview do Certificado" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPerfil;
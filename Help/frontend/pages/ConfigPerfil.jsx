import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, Search, MessageSquare, Bell, Plus,
  User, Mail, MapPin, Save, Building2, AlignLeft, FileText, Trash2,
  Camera, Calendar, GraduationCap, Clock, FileUp, CheckCircle, Pencil, X,
  Users, UserPlus, UserMinus, Compass
} from 'lucide-react';

import './ConfigPerfil.css';
import './Badges.css';
import logoImg from '../assets/logo.png';
import logoImgperfil from '../assets/fotoperfil.png';
import api from '../services/api';
import useUnreadCounts from './useUnreadCounts';
import GlobalSearch from '../components/GlobalSearch';

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

  const [fotoFile, setFotoFile] = useState(null);

  const [experiencias, setExperiencias] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);

  const naoLidas = useUnreadCounts();
  const [abaConexoes, setAbaConexoes] = useState('seguindo');
  const [seguindoLista, setSeguindoLista] = useState([]);
  const [seguidoresLista, setSeguidoresLista] = useState([]);
  const [descobrirLista, setDescobrirLista] = useState([]);
  const [contagemConexoes, setContagemConexoes] = useState({ seguidores: 0, seguindo: 0 });
  const [carregandoConexoes, setCarregandoConexoes] = useState(false);
  const [buscaConexao, setBuscaConexao] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('usuarioLogado');
    const tokenDireto = localStorage.getItem('token');

    if (!savedUser || !tokenDireto) {
      navigate('/login');
      return;
    }

    const parsed = JSON.parse(savedUser);
    setUserData((anterior) => ({
      ...anterior,
      id: parsed.id || parsed.idUsuario || parsed.uuid || '',
      nome: parsed.nome || parsed.name || '',
      email: parsed.email || '',
      token: tokenDireto
    }));

    let ativo = true;
    api.get('/perfis/me', {
      headers: { Authorization: `Bearer ${tokenDireto}` }
    }).then(({ data }) => {
      if (!ativo) return;

      setUserData({
        id: data.usuarioId || parsed.id || '',
        nome: data.nome || '',
        cargo: data.cargo || '',
        localidade: data.localidade || '',
        email: data.email || parsed.email || '',
        bio: data.bio || '',
        token: tokenDireto,
        fotoPerfil: data.fotoUrl || null
      });
      setExperiencias(data.experiencias || []);
      setCursos((data.cursos || []).map((curso) => ({
        ...curso,
        certificadoPdf: curso.certificadoUrl || null,
        nomeArquivo: curso.certificadoUrl ? 'Certificado salvo' : '',
        arquivoReal: null
      })));
    }).catch((error) => {
      console.error('Erro ao carregar o perfil individual:', error);
    });

    return () => {
      ativo = false;
    };
  }, [navigate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/') || file.size > 4 * 1024 * 1024) {
        alert('Escolha uma imagem de até 4 MB.');
        e.target.value = '';
        return;
      }
      setFotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({ ...prev, fotoPerfil: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const adicionarExperiencia = () => {
    setExperiencias([...experiencias, {
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
      nomeCurso: '',
      instituicao: '',
      cargaHoraria: '',
      tempoDuracao: '',
      certificadoPdf: null,
      nomeArquivo: '',
      arquivoReal: null
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
      if (file.size > 8 * 1024 * 1024) {
        alert('O certificado deve ter no máximo 8 MB.');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCursos(cursos.map(c =>
          c.id === id ? {
            ...c,
            arquivoReal: file,
            certificadoPdf: reader.result,
            nomeArquivo: file.name
          } : c
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token') || userData.token}`
  });

  const carregarConexoes = async () => {
    if (!userData.id) return;
    setCarregandoConexoes(true);
    try {
      const headers = getAuthHeaders();
      const [resSeguindo, resSeguidores, resContagem] = await Promise.all([
        api.get('/seguidores/seguindo', { headers }),
        api.get('/seguidores/meus-seguidores', { headers }),
        api.get(`/seguidores/contagem/USUARIO/${userData.id}`, { headers })
      ]);
      setSeguindoLista(resSeguindo.data || []);
      setSeguidoresLista(resSeguidores.data || []);
      setContagemConexoes(resContagem.data || { seguidores: 0, seguindo: 0 });
    } catch (error) {
      console.error('Erro ao carregar conexões:', error);
    } finally {
      setCarregandoConexoes(false);
    }
  };

  //lista todo mundo marcando quem eu ja sigo
  const carregarDescobrir = async () => {
    if (!userData.id) return;
    setCarregandoConexoes(true);
    try {
      const resUsuarios = await api.get('/comunicacao/contatos', { headers: getAuthHeaders() });
      const idsSeguindo = new Set(seguindoLista.map(u => `${u.tipoConta}:${u.id}`));

      setDescobrirLista(
        (resUsuarios.data || [])
          .map(u => ({
            id: u.id,
            tipoConta: u.tipoConta,
            nome: u.name || u.nome,
            cargo: u.subtitulo || u.cargo,
            localizacao: u.cidade,
            fotoUrl: u.fotoUrl,
            euSigoEle: u.seguindo ?? idsSeguindo.has(`${u.tipoConta}:${u.id}`)
          }))
      );
    } catch (error) {
      console.error('Erro ao carregar usuários para seguir:', error);
    } finally {
      setCarregandoConexoes(false);
    }
  };

  useEffect(() => {
    if (userData.id) carregarConexoes();
  }, [userData.id]);

  useEffect(() => {
    if (abaConexoes === 'descobrir') carregarDescobrir();
  }, [abaConexoes, userData.id, seguindoLista]);

  const seguirUsuario = async (pessoa) => {
    try {
      await api.post(`/seguidores/seguir/${pessoa.tipoConta || 'USUARIO'}/${pessoa.id}`, {}, { headers: getAuthHeaders() });
      await carregarConexoes();
    } catch (error) {
      console.error('Erro ao seguir usuário:', error);
      alert(error.response?.data || 'Não foi possível seguir este usuário.');
    }
  };

  const deixarDeSeguirUsuario = async (pessoa) => {
    try {
      await api.delete(`/seguidores/deixar-de-seguir/${pessoa.tipoConta || 'USUARIO'}/${pessoa.id}`, { headers: getAuthHeaders() });
      await carregarConexoes();
    } catch (error) {
      console.error('Erro ao deixar de seguir:', error);
      alert(error.response?.data || 'Não foi possível deixar de seguir este usuário.');
    }
  };

  const normalizarBusca = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filtrarPorNome = (lista) => lista.filter(u =>
    normalizarBusca(u.nome).includes(normalizarBusca(buscaConexao))
  );

  const handleSave = async (e) => {
    e.preventDefault();

    const tokenEnvio = localStorage.getItem('token') || userData.token;
    if (!tokenEnvio) {
      navigate('/login');
      return;
    }

    const perfilDados = {
      nome: userData.nome,
      cargo: userData.cargo,
      localidade: userData.localidade,
      bio: userData.bio,
      fotoUrl: userData.fotoPerfil,
      experiencias: experiencias.map(({ id, ...experiencia }) => experiencia),
      cursos: cursos.map(({ id, arquivoReal, certificadoPdf, nomeArquivo, ...curso }) => ({
        ...curso,
        certificadoUrl: certificadoPdf || curso.certificadoUrl || null
      }))
    };

    try {
      const response = await api.put('/perfis/me', perfilDados, {
        headers: { Authorization: `Bearer ${tokenEnvio}` }
      });
      const perfilSalvo = response.data;

      setUserData((anterior) => ({
        ...anterior,
        id: perfilSalvo.usuarioId,
        nome: perfilSalvo.nome || '',
        cargo: perfilSalvo.cargo || '',
        localidade: perfilSalvo.localidade || '',
        email: perfilSalvo.email || anterior.email,
        bio: perfilSalvo.bio || '',
        fotoPerfil: perfilSalvo.fotoUrl || null
      }));
      setExperiencias(perfilSalvo.experiencias || []);
      setCursos((perfilSalvo.cursos || []).map((curso) => ({
        ...curso,
        certificadoPdf: curso.certificadoUrl || null,
        nomeArquivo: curso.certificadoUrl ? 'Certificado salvo' : '',
        arquivoReal: null
      })));

      const sessao = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');
      localStorage.setItem('usuarioLogado', JSON.stringify({
        ...sessao,
        id: perfilSalvo.usuarioId,
        nome: perfilSalvo.nome,
        cargo: perfilSalvo.cargo,
        localidade: perfilSalvo.localidade,
        email: perfilSalvo.email,
        fotoPerfil: perfilSalvo.fotoUrl
      }));

      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar o perfil individual:', error.response || error);
      const dadosErro = error.response?.data;
      alert(dadosErro?.mensagem || dadosErro?.message || dadosErro?.error || (typeof dadosErro === 'string' ? dadosErro : 'Erro ao salvar alterações.'));
    }
  };

      return (
        <div className="config-container">

      <nav className="user-header">
        <div className="header-inner">
          <div className="header-left">
            <img src={logoImg} alt="Help Logo" className="header-logo" onClick={() => navigate('/feed')} />
            <GlobalSearch />
          </div>

          <div className="header-right-nav">
            <div className="nav-item" onClick={() => navigate('/feed')}><Home size={24} /><span>Início</span></div>
            <div className="nav-item" onClick={() => navigate('/cursos')}><BookOpen size={24} /><span>Cursos</span></div>
            <div className="nav-item" onClick={() => navigate('/vagas')}><Briefcase size={24} /><span>Vagas</span></div>
            <div className="nav-item" onClick={() => navigate('/mensagens')}>
              <div className="nav-icon-wrapper">
                <MessageSquare size={24} />
                {naoLidas.mensagens > 0 && <span className="nav-badge">{naoLidas.mensagens}</span>}
              </div>
              <span>Mensagens</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/notificacoes')}>
              <div className="nav-icon-wrapper">
                <Bell size={24} />
                {naoLidas.notificacoes > 0 && <span className="nav-badge">{naoLidas.notificacoes}</span>}
              </div>
              <span>Notificações</span>
            </div>
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
                    readOnly
                    title="O e-mail da conta não é alterado pelo perfil"
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

            <hr className="divider" />

            <div className="form-section">
              <h3 className="section-title"><Users size={20} /> Conexões</h3>

              <div className="conexoes-contadores">
                <span><strong>{contagemConexoes.seguidores}</strong> seguidores</span>
                <span><strong>{contagemConexoes.seguindo}</strong> seguindo</span>
              </div>

              <div className="conexoes-tabs">
                <button
                  type="button"
                  className={`conexoes-tab ${abaConexoes === 'seguindo' ? 'ativa' : ''}`}
                  onClick={() => setAbaConexoes('seguindo')}
                >
                  <UserMinus size={16} /> Seguindo
                </button>
                <button
                  type="button"
                  className={`conexoes-tab ${abaConexoes === 'seguidores' ? 'ativa' : ''}`}
                  onClick={() => setAbaConexoes('seguidores')}
                >
                  <Users size={16} /> Seguidores
                </button>
                <button
                  type="button"
                  className={`conexoes-tab ${abaConexoes === 'descobrir' ? 'ativa' : ''}`}
                  onClick={() => setAbaConexoes('descobrir')}
                >
                  <Compass size={16} /> Descobrir pessoas
                </button>
              </div>

              <div className="input-group full-width spacer-bottom">
                <div className="search-bar conexoes-busca">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nome..."
                    value={buscaConexao}
                    onChange={(e) => setBuscaConexao(e.target.value)}
                  />
                </div>
              </div>

              {carregandoConexoes ? (
                <p className="conexoes-vazio">Carregando...</p>
              ) : (
                <>
                  {abaConexoes === 'seguindo' && (
                    filtrarPorNome(seguindoLista).length === 0 ? (
                      <p className="conexoes-vazio">Você ainda não está seguindo ninguém.</p>
                    ) : (
                      <div className="conexoes-lista">
                        {filtrarPorNome(seguindoLista).map((pessoa) => (
                          <div key={`${pessoa.tipoConta}:${pessoa.id}`} className="conexao-card">
                            <div className="conexao-avatar">{pessoa.fotoUrl ? <img src={pessoa.fotoUrl} alt="" /> : (pessoa.nome || '?').charAt(0).toUpperCase()}</div>
                            <div className="conexao-info">
                              <span className="conexao-nome">{pessoa.nome}</span>
                              {pessoa.cargo && <span className="conexao-cargo">{pessoa.cargo}</span>}
                            </div>
                            <button
                              type="button"
                              className="conexao-btn deixar-seguir"
                              onClick={() => deixarDeSeguirUsuario(pessoa)}
                            >
                              <UserMinus size={16} /> Deixar de seguir
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {abaConexoes === 'seguidores' && (
                    filtrarPorNome(seguidoresLista).length === 0 ? (
                      <p className="conexoes-vazio">Ninguém está te seguindo ainda.</p>
                    ) : (
                      <div className="conexoes-lista">
                        {filtrarPorNome(seguidoresLista).map((pessoa) => (
                          <div key={`${pessoa.tipoConta}:${pessoa.id}`} className="conexao-card">
                            <div className="conexao-avatar">{pessoa.fotoUrl ? <img src={pessoa.fotoUrl} alt="" /> : (pessoa.nome || '?').charAt(0).toUpperCase()}</div>
                            <div className="conexao-info">
                              <span className="conexao-nome">{pessoa.nome}</span>
                              {pessoa.cargo && <span className="conexao-cargo">{pessoa.cargo}</span>}
                            </div>
                            {pessoa.euSigoEle ? (
                              <button
                                type="button"
                                className="conexao-btn deixar-seguir"
                                onClick={() => deixarDeSeguirUsuario(pessoa)}
                              >
                                <UserMinus size={16} /> Deixar de seguir
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="conexao-btn seguir"
                                onClick={() => seguirUsuario(pessoa)}
                              >
                                <UserPlus size={16} /> Seguir de volta
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {abaConexoes === 'descobrir' && (
                    filtrarPorNome(descobrirLista).length === 0 ? (
                      <p className="conexoes-vazio">Nenhum usuário encontrado.</p>
                    ) : (
                      <div className="conexoes-lista">
                        {filtrarPorNome(descobrirLista).map((pessoa) => (
                          <div key={`${pessoa.tipoConta}:${pessoa.id}`} className="conexao-card">
                            <div className="conexao-avatar">{pessoa.fotoUrl ? <img src={pessoa.fotoUrl} alt="" /> : (pessoa.nome || '?').charAt(0).toUpperCase()}</div>
                            <div className="conexao-info">
                              <span className="conexao-nome">{pessoa.nome}</span>
                              {pessoa.cargo && <span className="conexao-cargo">{pessoa.cargo}</span>}
                            </div>
                            {pessoa.euSigoEle ? (
                              <button
                                type="button"
                                className="conexao-btn deixar-seguir"
                                onClick={() => deixarDeSeguirUsuario(pessoa)}
                              >
                                <UserMinus size={16} /> Deixar de seguir
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="conexao-btn seguir"
                                onClick={() => seguirUsuario(pessoa)}
                              >
                                <UserPlus size={16} /> Seguir
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </>
              )}
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

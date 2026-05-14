import React, { useState } from 'react';
import nttLogo from '../assets/ntt-logo.jpg';
import { useNavigate, Link } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, MessageSquare, Bell, Search, MapPin,
  DollarSign, Building, Share2, X, Loader2, Upload, Filter, Mail,
  Trash2, ChevronDown, ChevronUp, Target, FileText,
  Award, CheckCircle, Plus, GraduationCap, Globe
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

import './Vagas.css';
import logoImg from '../assets/logo.png';
import userProfileImg from '../assets/fotoperfil.png';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const Vagas = () => {
  const navigate = useNavigate();

  const [showFiltros, setShowFiltros] = useState(true);
  const [vagaSelecionada, setVagaSelecionada] = useState(null);
  const [etapaCandidatura, setEtapaCandidatura] = useState('detalhes');

  const [termoBusca, setTermoBusca] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('');
  const [filtroRegime, setFiltroRegime] = useState('Todos');
  const [filtroModalidade, setFiltroModalidade] = useState('Todas');

  const [dadosExtraidos, setDadosExtraidos] = useState({
    nome: '', email: '', telefone: '', localizacao: '',
    resumo: '', github: '', site: '',
    educacao: [], cursos: [], experiencias: []
  });

  const listaVagas = [
    {
      id: 1,
      cargo: "Desenvolvedor Java Pleno",
      empresa: "NTT DATA",
      local: "São Paulo, SP",
      modalidade: "Remoto",
      tipo: "CLT",
      valor: "R$ 8.500,00",
      cursosNec: ["Superior em Eng. de Software ou áreas correlatas", "Java Avançado", "Spring Framework"],
      cursosDes: ["Certificação AWS Cloud", "Inglês Técnico", "ServiceNow Fundamentals"],
      descricaoCompleta: "Buscamos um profissional apaixonado por código limpo e arquitetura de sistemas. Você atuará em um time global, desenvolvendo soluções de alto impacto utilizando Java e ecossistema Spring."
    },
    {
      id: 2,
      cargo: "Analista de Sistemas",
      empresa: "Tech Solutions",
      local: "Anápolis, GO",
      modalidade: "Híbrido",
      tipo: "PJ",
      valor: "R$ 6.000,00",
      cursosNec: ["ServiceNow Certified Admin", "PostgreSQL Avançado"],
      cursosDes: ["Metodologias Ágeis (Scrum)", "ITIL 4 Foundation"],
      descricaoCompleta: "Responsável por ponte entre o negócio e o desenvolvimento, garantindo que as especificações técnicas atendam às necessidades dos usuários ServiceNow."
    }
  ];

  const vagasFiltradas = listaVagas.filter(vaga => {
    const matchTexto = vaga.cargo.toLowerCase().includes(termoBusca.toLowerCase()) ||
                       vaga.empresa.toLowerCase().includes(termoBusca.toLowerCase());
    const matchLocal = vaga.local.toLowerCase().includes(filtroLocal.toLowerCase());
    const matchRegime = filtroRegime === 'Todos' || vaga.tipo === filtroRegime;
    const matchModalidade = filtroModalidade === 'Todas' || vaga.modalidade === filtroModalidade;
    return matchTexto && matchLocal && matchRegime && matchModalidade;
  });

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const handleUploadCurriculo = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setEtapaCandidatura('carregando');

    try {
      const textoPdf = await extractTextFromPDF(file);
      const textoLower = textoPdf.toLowerCase();

      const emailMatch = textoPdf.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = textoPdf.match(/(?:\(?\d{2}\)?\s?)?9?\d{4}[-\s]?\d{4}/);
      const githubMatch = textoPdf.match(/github\.com\/[a-zA-Z0-9-]+/);

      const linhas = textoPdf.split('\n').map(l => l.trim()).filter(l => l.length > 3);
      let nomeBruto = linhas[0] || "Não identificado";

      // Ajuste para não capturar linhas gigantes e formatar para Title Case
      if (nomeBruto.length > 50) nomeBruto = nomeBruto.split(' ').slice(0, 4).join(' ');
      const nomeFinal = nomeBruto.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());

      const identificouEducacao = textoLower.includes('universidade') || textoLower.includes('bacharel') || textoLower.includes('cursando');
      const identificouJava = textoLower.includes('java') || textoLower.includes('spring');
      const identificouServiceNow = textoLower.includes('servicenow');

      setTimeout(() => {
        setDadosExtraidos({
          nome: nomeFinal,
          email: emailMatch ? emailMatch[0] : '',
          telefone: phoneMatch ? phoneMatch[0] : '',
          localizacao: 'Identificada no PDF',
          resumo: textoPdf.substring(0, 180).replace(/\n/g, ' ') + '...',
          github: githubMatch ? githubMatch[0] : '',
          site: '',
          educacao: identificouEducacao ? [{
            id: Date.now(),
            instituicao: 'Instituição identificada no texto',
            curso: textoLower.includes('software') ? 'Engenharia de Software' : 'Graduação',
            tipoNivel: 'Graduação',
            outroNivel: '',
            inicio: '',
            fim: ''
          }] : [],
          experiencias: (identificouJava || identificouServiceNow) ? [{
            id: Date.now() + 1,
            empresa: 'Empresa identificada',
            cargo: identificouJava ? 'Desenvolvedor Java' : 'Analista',
            anos: '0',
            meses: '0',
            atividades: 'Experiência identificada via análise de termos técnicos no PDF.'
          }] : [],
          cursos: identificouServiceNow ? [{ id: Date.now() + 2, nome: 'ServiceNow Fundamentals', emissor: 'ServiceNow', horas: '' }] : []
        });
        setEtapaCandidatura('revisao');
      }, 2000);

    } catch (error) {
      console.error("Erro ao ler PDF:", error);
      alert("Erro ao processar o arquivo. Tente novamente.");
      setEtapaCandidatura('detalhes');
    }
  };

  const handleInputChange = (campo, valor) => {
    setDadosExtraidos(prev => ({ ...prev, [campo]: valor }));
  };

  const handleListaChange = (lista, id, campo, valor) => {
    const novaLista = dadosExtraidos[lista].map(item =>
      item.id === id ? { ...item, [campo]: valor } : item
    );
    setDadosExtraidos(prev => ({ ...prev, [lista]: novaLista }));
  };

  const adicionarItem = (lista) => {
    const novosItens = {
      educacao: { id: Date.now(), instituicao: '', curso: '', tipoNivel: 'Ensino Médio', outroNivel: '', inicio: '', fim: '' },
      cursos: { id: Date.now(), nome: '', emissor: '', horas: '' },
      experiencias: { id: Date.now(), empresa: '', cargo: '', anos: '0', meses: '0', atividades: '' }
    };
    setDadosExtraidos(prev => ({ ...prev, [lista]: [...prev[lista], novosItens[lista]] }));
  };

  const removerItem = (lista, id) => {
    setDadosExtraidos(prev => ({ ...prev, [lista]: prev[lista].filter(item => item.id !== id) }));
  };

  const sectionTitleStyle = { color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #333', paddingBottom: '8px', marginTop: '20px' };
  const cardItemStyle = { background: '#1a1a21', border: '1px solid #333', borderRadius: '10px', padding: '15px', marginBottom: '10px', position: 'relative' };
  const inputRevisaoStyle = { background: '#121217', color: 'white', border: '1px solid #333', borderRadius: '6px', padding: '10px', width: '100%', fontSize: '14px', outline: 'none' };
  const labelStyle = { color: '#9ca3af', fontSize: '12px', marginBottom: '5px', display: 'block' };
  const avatarStyle = { width: '100%', height: '100%', borderRadius: '15px', objectFit: 'cover' };

  return (
    <div className="feed-container">
      {vagaSelecionada && (
        <div className="modal-overlay" onClick={() => { setVagaSelecionada(null); setEtapaCandidatura('detalhes'); }}>
          <div className="create-post-modal" onClick={e => e.stopPropagation()} style={{ width: '850px', background: '#121217', border: '1px solid #333', maxHeight: '90vh', borderRadius: '15px', display: 'flex', flexDirection: 'column' }}>

            <div className="modal-header" style={{ borderBottom: '1px solid #333', background: '#1a1a21', padding: '20px', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#a755f7', padding: '6px', borderRadius: '8px' }}><Briefcase size={18} color="white"/></div>
                <h3 style={{ color: 'white', margin: 0 }}>
                  {etapaCandidatura === 'revisao' ? 'Revisar Informações Profissionais' : 'Detalhes da Oportunidade'}
                </h3>
              </div>
              <button className="close-button" onClick={() => { setVagaSelecionada(null); setEtapaCandidatura('detalhes'); }}><X size={24} color="white" /></button>
            </div>

            <div className="modal-content" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {etapaCandidatura === 'detalhes' && (
                <div style={{ textAlign: 'left' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
                    <div>
                      <h2 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '24px' }}>{vagaSelecionada.cargo}</h2>
                      <p style={{ color: '#a755f7', fontWeight: 'bold', fontSize: '18px', margin: 0 }}>{vagaSelecionada.empresa}</p>
                    </div>
                    <div style={{ background: 'rgba(167, 85, 247, 0.1)', border: '1px solid #a755f7', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' }}>
                      {vagaSelecionada.tipo}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    <span className="location-text" style={{ background: '#121217', padding: '8px 15px', borderRadius: '8px', border: '1px solid #333', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={16} color="#a755f7" /> {vagaSelecionada.local}</span>
                    <span className="location-text" style={{ background: '#121217', padding: '8px 15px', borderRadius: '8px', border: '1px solid #333', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}><Target size={16} color="#a755f7" /> {vagaSelecionada.modalidade}</span>
                    <span className="location-text" style={{ background: '#121217', padding: '8px 15px', borderRadius: '8px', border: '1px solid #333', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}><DollarSign size={16} color="#a755f7" /> {vagaSelecionada.valor}</span>
                  </div>

                  <div style={{ marginBottom: '25px' }}>
                    <h4 style={{ color: 'white', marginBottom: '10px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={18} color="#a755f7" /> Sobre a Vaga
                    </h4>
                    <div style={{ background: '#1e0a3d', padding: '20px', borderRadius: '12px', border: '1px solid rgba(167, 85, 247, 0.3)' }}>
                      <p style={{ color: '#e5e7eb', lineHeight: '1.6', fontSize: '14px', margin: 0 }}>{vagaSelecionada.descricaoCompleta}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div>
                      <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={18} color="#4ade80" /> Cursos Necessários
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {vagaSelecionada.cursosNec.map((curso, idx) => (
                          <span key={idx} style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', color: '#4ade80', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{curso}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 style={{ color: 'white', marginBottom: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={18} color="#facc15" /> Cursos Desejáveis
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {vagaSelecionada.cursosDes.map((curso, idx) => (
                          <span key={idx} style={{ background: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.2)', color: '#facc15', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{curso}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(167, 85, 247, 0.05)', padding: '25px', borderRadius: '12px', border: '1px dashed #a755f7', display: 'flex', justifyContent: 'center' }}>
                    <button className="publish-button" style={{ width: 'auto', height: '48px', padding: '0 35px', fontSize: '15px' }} onClick={() => document.getElementById('pdf-upload').click()}>
                      <Upload size={18} style={{ marginRight: '10px' }} /> Enviar Currículo para esta Vaga
                      <input id="pdf-upload" type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleUploadCurriculo} />
                    </button>
                  </div>
                </div>
              )}

              {etapaCandidatura === 'carregando' && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Loader2 size={60} color="#a755f7" className="spinner-animation" />
                  <h3 style={{ color: 'white', marginTop: '20px' }}>Processando Currículo com PDF...</h3>
                  <p style={{ color: '#9ca3af', fontSize: '14px' }}>Extraindo informações do arquivo para o formulário.</p>
                </div>
              )}

              {etapaCandidatura === 'revisao' && (
                <div className="review-form-container" style={{ textAlign: 'left' }}>
                  <h4 style={sectionTitleStyle}><Mail size={18} color="#a755f7"/> Dados Principais e Contato</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <div><label style={labelStyle}>Nome Completo</label><input style={inputRevisaoStyle} value={dadosExtraidos.nome} onChange={(e) => handleInputChange('nome', e.target.value)} /></div>
                    <div><label style={labelStyle}>Email</label><input style={inputRevisaoStyle} value={dadosExtraidos.email} onChange={(e) => handleInputChange('email', e.target.value)} /></div>
                    <div><label style={labelStyle}>Telefone</label><input style={inputRevisaoStyle} value={dadosExtraidos.telefone} onChange={(e) => handleInputChange('telefone', e.target.value)} /></div>
                    <div><label style={labelStyle}>Localização</label><input style={inputRevisaoStyle} value={dadosExtraidos.localizacao} onChange={(e) => handleInputChange('localizacao', e.target.value)} /></div>
                  </div>

                  <h4 style={sectionTitleStyle}><Globe size={18} color="#a755f7"/> Links Profissionais</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <div>
                        <label style={labelStyle}>Site Pessoal / Portfólio (Opcional)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Globe size={14} color="#a755f7" style={{ position: 'absolute', left: '10px' }} />
                            <input
                                style={{ ...inputRevisaoStyle, paddingLeft: '35px' }}
                                placeholder="https://seusite.com"
                                value={dadosExtraidos.site}
                                onChange={(e) => handleInputChange('site', e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={labelStyle}>GitHub (Opcional)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Share2 size={14} color="#a755f7" style={{ position: 'absolute', left: '10px' }} />
                            <input
                                style={{ ...inputRevisaoStyle, paddingLeft: '35px' }}
                                placeholder="github.com/usuario"
                                value={dadosExtraidos.github}
                                onChange={(e) => handleInputChange('github', e.target.value)}
                            />
                        </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={sectionTitleStyle}><GraduationCap size={18} color="#a755f7"/> Educação</h4>
                    <button onClick={() => adicionarItem('educacao')} style={{ color: '#a755f7', background: 'none', border: 'none', cursor: 'pointer' }}><Plus size={20}/></button>
                  </div>
                  {dadosExtraidos.educacao.map(edu => (
                    <div key={edu.id} style={cardItemStyle}>
                      <button onClick={() => removerItem('educacao', edu.id)} style={{ position: 'absolute', right: '15px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button>

                      <div style={{ display: 'grid', gridTemplateColumns: edu.tipoNivel === 'Outro' ? '1fr 1fr' : '1fr', gap: '15px', marginBottom: '10px' }}>
                        <div>
                          <label style={labelStyle}>Nível de Escolaridade</label>
                          <select
                            style={inputRevisaoStyle}
                            value={edu.tipoNivel}
                            onChange={(e) => handleListaChange('educacao', edu.id, 'tipoNivel', e.target.value)}
                          >
                            <option value="Ensino Fundamental">Ensino Fundamental</option>
                            <option value="Ensino Médio">Ensino Médio</option>
                            <option value="Ensino Médio Técnico">Ensino Médio Técnico</option>
                            <option value="Tecnólogo">Tecnólogo</option>
                            <option value="Graduação">Graduação</option>
                            <option value="Mestrado">Mestrado</option>
                            <option value="Doutorado">Doutorado</option>
                            <option value="Outro">Outro</option>
                          </select>
                        </div>
                        {edu.tipoNivel === 'Outro' && (
                          <div>
                            <label style={labelStyle}>Especifique o Nível</label>
                            <input
                              style={inputRevisaoStyle}
                              placeholder="Ex: Pós-Doutorado"
                              value={edu.outroNivel}
                              onChange={(e) => handleListaChange('educacao', edu.id, 'outroNivel', e.target.value)}
                            />
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                         <div><label style={labelStyle}>Instituição</label><input style={inputRevisaoStyle} value={edu.instituicao} onChange={(e) => handleListaChange('educacao', edu.id, 'instituicao', e.target.value)} /></div>
                         <div><label style={labelStyle}>Curso / Área de Estudo</label><input style={inputRevisaoStyle} value={edu.curso} onChange={(e) => handleListaChange('educacao', edu.id, 'curso', e.target.value)} /></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                         <div><label style={labelStyle}>Ano de Início</label><input style={inputRevisaoStyle} value={edu.inicio} onChange={(e) => handleListaChange('educacao', edu.id, 'inicio', e.target.value)} /></div>
                         <div><label style={labelStyle}>Ano de Conclusão</label><input style={inputRevisaoStyle} value={edu.fim} onChange={(e) => handleListaChange('educacao', edu.id, 'fim', e.target.value)} /></div>
                      </div>
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={sectionTitleStyle}><Award size={18} color="#a755f7"/> Cursos e Certificados</h4>
                    <button onClick={() => adicionarItem('cursos')} style={{ color: '#a755f7', background: 'none', border: 'none', cursor: 'pointer' }}><Plus size={20}/></button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {dadosExtraidos.cursos.map(curso => (
                      <div key={curso.id} style={{ ...cardItemStyle, marginBottom: 0 }}>
                        <button onClick={() => removerItem('cursos', curso.id)} style={{ position: 'absolute', right: '10px', top: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14}/></button>
                        <label style={labelStyle}>Curso</label>
                        <input style={{...inputRevisaoStyle, marginBottom: '8px'}} value={curso.nome} onChange={(e) => handleListaChange('cursos', curso.id, 'nome', e.target.value)} />
                        <div style={{display: 'flex', gap: '5px'}}>
                           <input style={inputRevisaoStyle} placeholder="Emissor" value={curso.emissor} onChange={(e) => handleListaChange('cursos', curso.id, 'emissor', e.target.value)} />
                           <input style={inputRevisaoStyle} placeholder="Horas" value={curso.horas} onChange={(e) => handleListaChange('cursos', curso.id, 'horas', e.target.value)} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={sectionTitleStyle}><Briefcase size={18} color="#a755f7"/> Experiência Profissional</h4>
                    <button onClick={() => adicionarItem('experiencias')} style={{ color: '#a755f7', background: 'none', border: 'none', cursor: 'pointer' }}><Plus size={20}/></button>
                  </div>
                  {dadosExtraidos.experiencias.map(exp => (
                    <div key={exp.id} style={cardItemStyle}>
                      <button onClick={() => removerItem('experiencias', exp.id)} style={{ position: 'absolute', right: '15px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <div><label style={labelStyle}>Cargo</label><input style={inputRevisaoStyle} value={exp.cargo} onChange={(e) => handleListaChange('experiencias', exp.id, 'cargo', e.target.value)} /></div>
                        <div><label style={labelStyle}>Empresa</label><input style={inputRevisaoStyle} value={exp.empresa} onChange={(e) => handleListaChange('experiencias', exp.id, 'empresa', e.target.value)} /></div>
                        <div><label style={labelStyle}>Anos</label><input style={inputRevisaoStyle} value={exp.anos} onChange={(e) => handleListaChange('experiencias', exp.id, 'anos', e.target.value)} /></div>
                        <div><label style={labelStyle}>Meses</label><input style={inputRevisaoStyle} value={exp.meses} onChange={(e) => handleListaChange('experiencias', exp.id, 'meses', e.target.value)} /></div>
                      </div>
                      <label style={labelStyle}>Atividades</label>
                      <textarea style={{ ...inputRevisaoStyle, height: '80px', resize: 'none' }} value={exp.atividades} onChange={(e) => handleListaChange('experiencias', exp.id, 'atividades', e.target.value)} />
                    </div>
                  ))}

                  <button className="publish-button" style={{ width: '100%', height: '55px', marginTop: '40px' }} onClick={() => {alert("Candidatura enviada!"); setVagaSelecionada(null);}}>Confirmar e Enviar Candidatura</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="user-header">
        <div className="header-inner">
          <div className="header-left">
            <img src={logoImg} alt="Logo" className="header-logo" onClick={() => navigate('/feed')} />
            <div className="search-bar">
              <Search size={18} color="#9ca3af" />
              <input type="text" placeholder="Buscar no sistema..." />
            </div>
          </div>
          <div className="header-right-nav">
            <Link to="/feed" className="nav-item"><Home size={22} /><span>Início</span></Link>
            <Link to="/cursos" className="nav-item"><BookOpen size={22} /><span>Cursos</span></Link>
            <Link to="/vagas" className="nav-item active"><Briefcase size={22} /><span>Vagas</span></Link>
            <div className="nav-item"><MessageSquare size={22} /><span>Mensagens</span></div>
            <div className="nav-item"><Bell size={22} /><span>Notificações</span></div>
          </div>
        </div>
      </nav>

      <main className="feed-content">
        <aside className="left-column">
          <div className="profile-card-dark" onClick={() => navigate('/configuracao-perfil')}//perfil config
            style={{
              cursor: 'pointer',
              background: '#121217',
              borderRadius: '20px',
              border: '1px solid #333',
              padding: '20px'
            }}>

            <div className="profile-header-info" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div className="avatar-preview-small" style={{ position: 'relative', width: '70px', height: '70px' }}>
                <div style={{
                  position: 'absolute',
                  inset: '-3px',
                  borderRadius: '18px',
                  background: 'linear-gradient(45deg, #a755f7, #6366f1)',
                  zIndex: 0
                }}></div>
                <img src={userProfileImg} alt="Perfil" style={{ ...avatarStyle, position: 'relative', zIndex: 1, border: '3px solid #121217' }} />
              </div>

              <div className="user-details-text">
                <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '700' }}>Anny Gabrielly</h3>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0' }}>Analista de Sistemas | Engenharia de Software</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} color="#9ca3af" />
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>Silvânia, Goiás</span>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '20px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', background: 'white', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px'
              }}>
              <div className="company-logo-box"><img src={nttLogo} alt="NTT DATA" /></div>
              </div>
              <span style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>NTT DATA</span>
            </div>
          </div>
        </aside>

        <section className="main-column">
          <div className="filter-container-dark" style={{//filtro e lista de vagas
            background: 'linear-gradient(135deg, #1e0a3d 0%, #0f051a 100%)',
            borderRadius: '15px', padding: '25px', borderLeft: '5px solid #a755f7', marginBottom: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowFiltros(!showFiltros)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Filter size={22} color="#a755f7" />
                <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '600' }}>Configurar Busca de Vagas</h3>
              </div>
              {showFiltros ? <ChevronUp size={24} color="#a755f7" /> : <ChevronDown size={24} color="#a755f7" />}
            </div>

            {showFiltros && (
              <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '15px' }}>
                   <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Search size={18} color="#9ca3af" />
                      <input
                        placeholder="Cargo ou empresa..."
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                      />
                   </div>
                   <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MapPin size={18} color="#9ca3af" />
                      <input
                        placeholder="Cidade ou Estado..."
                        style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                        value={filtroLocal}
                        onChange={(e) => setFiltroLocal(e.target.value)}
                      />
                   </div>
                </div>

                <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#9ca3af', fontSize: '14px' }}>Regime:</span>
                    <select
                      value={filtroRegime}
                      onChange={(e) => setFiltroRegime(e.target.value)}
                      style={{ background: '#121217', color: 'white', border: '1px solid #333', padding: '8px 12px', borderRadius: '6px', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="Todos">Todos</option>
                      <option value="CLT">CLT</option>
                      <option value="PJ">PJ</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: '#9ca3af', fontSize: '14px' }}>Modalidade:</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['Todas', 'Presencial', 'Remoto', 'Híbrido'].map(mod => (
                        <button
                          key={mod}
                          onClick={() => setFiltroModalidade(mod)}
                          style={{
                            padding: '6px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', transition: '0.3s',
                            background: filtroModalidade === mod ? '#a755f7' : 'transparent',
                            color: filtroModalidade === mod ? 'white' : '#9ca3af',
                            border: `1px solid ${filtroModalidade === mod ? '#a755f7' : '#333'}`
                          }}
                        >
                          {mod}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <h2 style={{ fontSize: '18px', color: 'white', marginBottom: '20px' }}>Vagas Sugeridas ({vagasFiltradas.length})</h2>

          {vagasFiltradas.map(vaga => (
            <div className="post" key={vaga.id} onClick={() => setVagaSelecionada(vaga)} style={{ cursor: 'pointer', marginBottom: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ background: '#1a1a21', border: '1px solid #333', width: '60px', height: '60px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={30} color="#a755f7"/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ color: 'white', margin: 0, fontSize: '18px' }}>{vaga.cargo}</h4>
                      <p style={{ color: '#a755f7', fontWeight: '600', margin: '4px 0' }}>{vaga.empresa}</p>
                      <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                        <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14}/> {vaga.local}</span>
                        <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Globe size={14}/> {vaga.modalidade}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Vagas;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Home, BookOpen, Briefcase, Search, MapPin, MessageSquare, Bell, Info, ChevronRight,
  Clock, Star, X, CheckCircle, Filter, TrendingUp, Loader2, BookText, ShieldCheck
} from 'lucide-react';
import './Cursos.css';
import logoImg from '../assets/logo.png';
import nttLogo from '../assets/ntt-logo.jpg';
import logoImgperfil from '../assets/fotoperfil.png';
import qrCodePix from '../assets/qrcode-pix.png';

const validarCPF = (cpf) => {
  if (!cpf) return false;
  const limpo = cpf.replace(/[^\d]+/g, '');
  if (limpo.length !== 11 || !!limpo.match(/(\d)\1{10}/)) return false;

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) soma += parseInt(limpo.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(limpo.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(limpo.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(limpo.substring(10, 11))) return false;

  return true;
};

const DetalhesCursoModal = ({ curso, onFechar, onMatricular }) => { //modal detalhes dos cursos
  if (!curso) return null;
  const isGratuito = curso.valor === 'Gratuito';

  const moduloStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 15px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '0 10px 10px 0',
    borderLeft: '3px solid #6366f1',
    color: '#d1d5db',
    fontSize: '13px',
    boxSizing: 'border-box',
    width: '100%',
  };

  return (
    <div
      className="modal-overlay"
      onClick={onFechar}
      style={{
        zIndex: 1100,
        position: 'fixed',
        top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="create-post-modal"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#13131a',
          borderRadius: '22px',
          border: '1px solid #2d2d3a',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="modal-header"
          style={{
            padding: '25px 35px',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ color: 'white', margin: 0 }}>Detalhes do Treinamento</h3>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={24} color="white" />
          </button>
        </div>

        <div
          className="modal-content"
          style={{
            padding: '30px 35px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          {/* LOGO + INFO */}
          <div style={{ display: 'flex', gap: '25px', marginBottom: '30px', alignItems: 'center' }}>
            <div
              className="company-logo-box"
              style={{
                width: '80px', height: '80px', flexShrink: 0,
                borderRadius: '12px', background: '#fff', padding: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <img src={curso.foto} alt={curso.titulo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ color: 'white', margin: 0, fontSize: '20px' }}>{curso.titulo}</h2>
              <p style={{ color: '#a755f7', fontWeight: '500', fontSize: '14px', marginTop: '4px' }}>{curso.instrutor}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '10px', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold',
                    background: isGratuito ? 'rgba(52, 211, 153, 0.1)' : 'rgba(250, 204, 21, 0.1)',
                    color: isGratuito ? '#34d399' : '#facc15',
                    border: `1px solid ${isGratuito ? 'rgba(52, 211, 153, 0.2)' : 'rgba(250, 204, 21, 0.2)'}`,
                    display: 'inline-flex', alignItems: 'center',
                  }}>
                    {isGratuito ? 'GRATUITO' : (curso.preco || 'PAGO')}
                  </span>

                  <span style={{
                    fontSize: '11px', fontWeight: 'bold',
                    color: curso.isIlimitado ? '#34d399' : '#f87171',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    <span style={{ fontSize: '14px', lineHeight: 1 }}>●</span>
                    {curso.isIlimitado ? 'ACESSO ILIMITADO' : `EXPIRA EM: ${curso.dataLimite || '31/12'}`}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} color="#9ca3af" /> {curso.nivel || 'Iniciante'}
                  </span>
                  <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} color="#facc15" fill="#facc15" /> 4.9
                  </span>
                  <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> {curso.duracao}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ color: 'white', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' }}>
              <Info size={18} color="#a755f7" /> Sobre o treinamento
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              {curso.descricao || 'Este treinamento oferece uma imersão completa nos conceitos práticos e teóricos necessários para sua evolução profissional.'}
            </p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ color: 'white', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' }}>
              <BookText size={18} color="#a755f7" /> Grade Curricular
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {curso.modulos && curso.modulos.length > 0 ? (
                curso.modulos.map((mod, i) => (
                  <div key={i} style={moduloStyle}>{mod}</div>
                ))
              ) : (
                <>
                  <div style={moduloStyle}>Módulo 1: Introdução e Conceitos Base</div>
                  <div style={moduloStyle}>Módulo 2: Práticas Avançadas</div>
                  <div style={moduloStyle}>Módulo 3: Projeto Final e Certificação</div>
                </>
              )}
            </div>
          </div>

          <button
            className="publish-button"
            style={{ width: '100%', height: '48px', fontSize: '15px', borderRadius: '12px', background: '#a755f7', fontWeight: 'bold' }}
            onClick={() => onMatricular(curso)}
          >
            Matricular-se agora
          </button>
        </div>
      </div>
    </div>
  );
};

const MatriculaForm = ({ curso, usuarioDados, onFinalizar, onFechar }) => { //formulario matricula
  const [etapa, setEtapa] = useState('dados');
  const [metodoPagamento, setMetodoPagamento] = useState('cartao');
  const [tokenInput, setTokenInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaChecked, setRecaptchaChecked] = useState(false);
  const [compraNegada, setCompraNegada] = useState(false);
  const [parcelas, setParcelas] = useState(1);

  const [dados, setDados] = useState({
    nome: usuarioDados?.name || '',
    email: usuarioDados?.email || '',
    telefone: '', cidade: '', uf: '', situacao: '', titular: '', cpf: '', numeroCartao: '', vencimento: '', cvv: ''
  });

  const codigoPix = '00020126480014BR.GOV.BCB.PIX0126annygabbyoficial@gmail.com5204000053039865802BR5901N6001C62080504HELP6304876A';

  const copiarCodigoPix = async () => {
    try {
      await navigator.clipboard.writeText(codigoPix);
      alert('Código PIX copiado com sucesso!');
    } catch (err) {
      alert('Erro ao copiar código PIX.');
    }
  };

  const gerarOpcoesParcelamento = () => {
    const valorBase = 199.90;
    const lista = [];
    for (let i = 1; i <= 12; i++) {
      const taxaJuros = i === 1 ? 0 : 0.02 * i;
      const valorTotalComJuros = valorBase * (1 + taxaJuros);
      const valorParcela = valorTotalComJuros / i;
      lista.push({
        num: i,
        valor: valorParcela.toFixed(2),
        total: valorTotalComJuros.toFixed(2),
        texto: `${i}x de R$ ${valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${i === 1 ? '(Sem Juros)' : ''}`
      });
    }
    return lista;
  };

  const opcoes = gerarOpcoesParcelamento();

  const handleCPFChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    v = v.replace(/(\d{3})(\d*)/, '$1.$2').replace(/(\d{3})(\d*)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setDados({ ...dados, cpf: v.substring(0, 14) });
  };

  const handleCartaoChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    v = v.replace(/(\d{4})(\d)/g, '$1 $2');
    setDados({ ...dados, numeroCartao: v.trim().substring(0, 19) });
  };

  const handleVencimentoChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
    setDados({ ...dados, vencimento: v.substring(0, 5) });
  };

  const podeAvancar = dados.nome && dados.email && dados.cidade && dados.uf && dados.situacao;

  const dispararGeracaoToken = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/matricula/gerar-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: dados.email, nomeCurso: curso.titulo })
      });
      if (response.ok) {
        setEtapa('token');
      } else {
        const erro = await response.json();
        alert('Erro ao enviar token: ' + (erro.error || 'Tente novamente.'));
      }
    } catch (error) {
      alert('Servidor indisponível.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProximoPasso = () => {
    if (curso.valor === 'Gratuito') dispararGeracaoToken();
    else setEtapa('pagamento');
  };

  const handleConfirmarCompra = () => {
    if (metodoPagamento === 'cartao' && (!recaptchaChecked || dados.numeroCartao.length < 15)) {
      alert('Por favor, verifique os dados do cartão.');
      return;
    }
    setIsLoading(true);
    setCompraNegada(false);
    setTimeout(() => { dispararGeracaoToken(); }, 2500);
  };

  const handleAtivarMatricula = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/matricula/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput })
      });
      if (response.ok) onFinalizar(curso);
      else alert('Token inválido ou expirado.');
    } catch (error) {
      alert('Erro ao validar token.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    height: '42px',
    padding: '0 15px',
    borderRadius: '10px',
    background: '#1a1a21',
    border: '1px solid #333',
    color: 'white',
    boxSizing: 'border-box',
    fontSize: '13px',
  };

  const metodoBtnStyle = (ativo) => ({
    flex: 1,
    height: '42px',
    color: 'white',
    fontWeight: '700',
    border: ativo ? '1px solid #a855f7' : '1px solid #333',
    background: ativo ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  });

  return (
    <div
      className="modal-overlay"
      onClick={onFechar}
      style={{
        zIndex: 1200, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '20px', boxSizing: 'border-box',
      }}
    >
      <div
        className="create-post-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '620px', background: '#13131a', borderRadius: '22px',
          border: '1px solid #2d2d3a', position: 'relative', overflow: 'hidden',
          boxShadow: '0 0 40px rgba(167,85,247,0.18)', boxSizing: 'border-box',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        }}
      >
        {isLoading && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 100,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', borderRadius: '22px',
          }}>
            <Loader2 size={50} color="#a855f7" className="animate-spin" />
            <p style={{ color: 'white', marginTop: '15px', fontWeight: '600' }}>Processando sua solicitação...</p>
          </div>
        )}

        <div
          className="modal-header"
          style={{
            padding: '20px 28px', borderBottom: '1px solid #2d2d3a',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <h3 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '700' }}>Finalizar Matrícula</h3>
          <button onClick={onFechar} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={28} color="white" />
          </button>
        </div>

        <div
          className="modal-content"
          style={{
            padding: '20px 28px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'stretch',
            boxSizing: 'border-box',
            width: '100%',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {compraNegada && (
            <div style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444',
              padding: '14px', borderRadius: '12px', color: '#ef4444', textAlign: 'center',
              width: '100%', boxSizing: 'border-box',
            }}>
              Compra negada pela operadora.
            </div>
          )}

          {etapa === 'dados' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'stretch', width: '100%' }}>

              <div style={{ //card roxo
                background: 'rgba(167,85,247,0.08)',
                padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(167,85,247,0.15)',
                  width: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'center'
                }}>
                <p style={{ color: '#bdbdbd', margin: 0, fontSize: '11px' }}>Você está se matriculando em:</p>
                <h4 style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: '4px 0 0 0' }}>{curso.titulo}</h4>
              </div>

              <input className="filter-select" placeholder="Nome Completo" value={dados.nome}
                onChange={(e) => setDados({ ...dados, nome: e.target.value })} />
              <input className="filter-select" placeholder="E-mail" value={dados.email}
                onChange={(e) => setDados({ ...dados, email: e.target.value })} />
              <input className="filter-select" placeholder="Telefone (WhatsApp)"
                onChange={(e) => setDados({ ...dados, telefone: e.target.value })} />

              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <input className="filter-select" placeholder="Cidade" style={{ flex: 2, minWidth: 0 }}
                  onChange={(e) => setDados({ ...dados, cidade: e.target.value })} />
                <input className="filter-select" placeholder="UF" maxLength="2" style={{ flex: 1, minWidth: 0 }}
                  onChange={(e) => setDados({ ...dados, uf: e.target.value })} />
              </div>

              <select className="filter-select" onChange={(e) => setDados({ ...dados, situacao: e.target.value })}>
                <option value="">Você trabalha na área?</option>
                <option value="Sim">Trabalho na área</option>
                <option value="Estudo">Só estudo</option>
                <option value="TrabalhoEstudo">Trabalho e Estudo</option>
                <option value="Nenhum">Nenhum</option>
              </select>

              <button
                className="publish-button"
                disabled={!podeAvancar}
                style={{ marginTop: '10px', height: '50px', borderRadius: '14px', fontSize: '15px', fontWeight: '700' }}
                onClick={handleProximoPasso}
              >
                {curso.valor === 'Gratuito' ? 'Confirmar Dados' : 'Avançar para Pagamento'}
              </button>
            </div>
          )}

          {etapa === 'pagamento' && ( //etapa pagamento
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button
                  onClick={() => setMetodoPagamento('cartao')}
                  style={metodoBtnStyle(metodoPagamento === 'cartao')}
                >
                  Cartão
                </button>
                <button
                  onClick={() => setMetodoPagamento('pix')}
                  style={metodoBtnStyle(metodoPagamento === 'pix')}
                >
                  PIX
                </button>
              </div>

              {metodoPagamento === 'cartao' ? ( //formulario cartao
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                  <input
                    className="filter-select"
                    placeholder="Número do Cartão"
                    value={dados.numeroCartao}
                    onChange={handleCartaoChange}
                    style={inputStyle}
                  />

                  <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                    <input
                      className="filter-select"
                      placeholder="MM/AA"
                      value={dados.vencimento}
                      onChange={handleVencimentoChange}
                      style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                    />
                    <input
                      className="filter-select"
                      placeholder="CVV"
                      maxLength="3"
                      onChange={(e) => setDados({ ...dados, cvv: e.target.value })}
                      style={{ ...inputStyle, flex: 1, minWidth: 0 }}
                    />
                  </div>

                  <input
                    className="filter-select"
                    placeholder="Nome impresso no cartão"
                    onChange={(e) => setDados({ ...dados, titular: e.target.value })}
                    style={inputStyle}
                  />

                  <input
                    className="filter-select"
                    placeholder="CPF do Titular"
                    value={dados.cpf}
                    onChange={handleCPFChange}
                    style={inputStyle}
                  />

                  <div
                    style={{
                      background: '#1a1a21', padding: '14px', borderRadius: '12px',
                      border: '1px solid #333', display: 'flex', alignItems: 'center',
                      gap: '12px', cursor: 'pointer', boxSizing: 'border-box',
                    }}
                    onClick={() => setRecaptchaChecked(!recaptchaChecked)}
                  >
                    <div style={{
                      width: '22px', height: '22px', border: '2px solid #a855f7',
                      borderRadius: '5px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0,
                    }}>
                      {recaptchaChecked && <CheckCircle size={16} color="#a855f7" />}
                    </div>
                    <span style={{ color: '#d1d5db', fontSize: '13px' }}>
                      Verify you are not a robot
                    </span>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                      <ShieldCheck size={20} color="#9ca3af" />
                    </div>
                  </div>

                  <div>
                    <label style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                      Opções de Parcelamento
                    </label>
                    <select
                      className="filter-select" //parcelamento
                      value={parcelas}
                      onChange={(e) => setParcelas(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    >
                      {opcoes.map((op) => (
                        <option key={op.num} value={op.num}>{op.texto}</option>
                      ))}
                    </select>
                  </div>
                </div>

              ) : (
                <div style={{ //formulario pix
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(167,85,247,0.15)',
                  borderRadius: '18px', padding: '20px 20px 16px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '14px',
                  boxSizing: 'border-box',
                }}>
                  <h3 style={{ color: 'white', margin: 0, fontSize: '18px' }}>Pagamento via PIX</h3>

                  <div style={{ background: 'white', padding: '10px', borderRadius: '12px' }}>
                    <img
                      src={qrCodePix} alt="QR CODE PIX"
                      style={{ width: '150px', height: '150px', objectFit: 'contain', borderRadius: '8px', display: 'block' }}
                    />
                  </div>

                  <p style={{ color: '#9ca3af', fontSize: '12px', lineHeight: '1.4', maxWidth: '420px', margin: 0 }}>
                    Escaneie o QRCode com o aplicativo do seu banco ou copie o código PIX abaixo para concluir o pagamento.
                  </p>

                  <div style={{
                    width: '100%', background: '#1a1a21', border: '1px solid #333',
                    borderRadius: '12px', padding: '10px 14px', wordBreak: 'break-all',
                    color: '#d1d5db', fontSize: '11px', lineHeight: '1.5',
                    boxSizing: 'border-box', textAlign: 'left',
                  }}>
                    {codigoPix}
                  </div>

                  <button
                    onClick={copiarCodigoPix}
                    style={{
                      width: '100%', height: '42px', borderRadius: '12px', border: 'none',
                      cursor: 'pointer', background: 'linear-gradient(90deg,#9333ea,#a855f7)',
                      color: 'white', fontWeight: '700', fontSize: '13px',
                      boxShadow: '0 0 25px rgba(168,85,247,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    Copiar Código PIX
                  </button>
                </div>
              )}

              <div style={{ borderTop: '1px solid #333', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>Total Final:</span>
                  <span style={{ color: '#a855f7', fontSize: '18px', fontWeight: '800' }}>
                    {metodoPagamento === 'cartao' //total cartão
                      ? `R$ ${parseFloat(opcoes[parcelas - 1]?.total || 0).toFixed(2).replace('.', ',')}`
                      : curso.preco}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button //confirmar + voltar
                  className="publish-button"
                  disabled={metodoPagamento === 'cartao' && !recaptchaChecked}
                  style={{
                    height: '44px', borderRadius: '12px', fontWeight: '700', fontSize: '14px',
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onClick={handleConfirmarCompra}
                >
                  Confirmar Compra
                </button>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', padding: '4px 0' }}
                    onClick={() => setEtapa('dados')}
                  >
                    ← Voltar aos dados
                  </button>
                </div>
              </div>
            </div>
          )}

          {etapa === 'token' && ( //token
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                background: 'rgba(52,211,153,0.1)', width: '90px', height: '90px',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 20px',
              }}>
                <CheckCircle size={50} color="#34d399" />
              </div>

              <h3 style={{ color: 'white', marginBottom: '10px' }}>Token Enviado!</h3>
              <p style={{ color: '#9ca3af', marginBottom: '25px', lineHeight: '1.6' }}>
                Verifique seu e-mail <strong>{dados.email}</strong>
              </p>

              <input
                className="filter-select"
                placeholder="DIGITE O TOKEN"
                style={{ textAlign: 'center', fontSize: '22px', letterSpacing: '8px', fontWeight: 'bold', width: '100%', boxSizing: 'border-box' }}
                onChange={(e) => setTokenInput(e.target.value)}
              />

              <button
                className="publish-button"
                style={{ marginTop: '25px', width: '100%', height: '50px', borderRadius: '14px', fontWeight: '700' }}
                onClick={handleAtivarMatricula}
              >
                Ativar minha Matrícula
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Cursos = () => {
  const navigate = useNavigate();
  const [showMeusCursosModal, setShowMeusCursosModal] = useState(false);
  const [cursoParaDetalhes, setCursoParaDetalhes] = useState(null);
  const [cursoParaMatricula, setCursoParaMatricula] = useState(null);
  const [cursoSelecionadoProgresso, setCursoSelecionadoProgresso] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [filtroNivel, setFiltroNivel] = useState('Todos');
  const [filtroPreco, setFiltroPreco] = useState('Todos');

  const [meusCursosMatriculados, setMeusCursosMatriculados] = useState([
    {
      id: 1,
      titulo: 'Java Spring Boot Profissional',
      progresso: 45,
      foto: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
      duracao: '40h',
      nivel: 'Avançado',
      instrutor: 'Help Academy'
    }
  ]);

  const [novosCursosData] = useState([
    {
      id: 1,
      titulo: 'Java Spring Boot Profissional',
      instrutor: 'Help Academy',
      categoria: 'Programação',
      nivel: 'Avançado',
      duracao: '40h',
      valor: 'Gratuito',
      isIlimitado: true,
      dataLimite: '31/12',
      foto: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
      descricao: 'Domine o framework Java mais utilizado no mercado. Neste treinamento, você aprenderá desde a configuração do ambiente até o deploy de APIs REST seguras e escaláveis utilizando Spring Boot, JPA e AWS.',
      modulos: ['Setup e Spring Initializr', 'JPA e Hibernate', 'Spring Security', 'Documentação com Swagger', 'Deploy AWS']
    },
    {
      id: 5,
      titulo: 'Arquitetura Cloud AWS',
      instrutor: 'Amazon',
      categoria: 'Cloud',
      nivel: 'Intermediário',
      duracao: '60h',
      valor: 'Pago',
      preco: 'R$ 199,90',
      isIlimitado: false,
      dataLimite: '31/12',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
      descricao: 'Aprenda a projetar soluções resilientes na nuvem da Amazon. Este curso foca nos principais serviços da AWS como EC2, S3 e Lambda, preparando você para as certificações oficiais.',
      modulos: ['Fundamentos Cloud', 'EC2 e S3', 'Lambda e Serverless', 'VPC e Segurança', 'Monitoramento CloudWatch']
    }
  ]);

  const cursosFiltrados = novosCursosData.filter(curso => {
    const matchesCategoria = filtroCategoria === 'Todos' || curso.categoria.toLowerCase() === filtroCategoria.toLowerCase();
    const matchesNivel = filtroNivel === 'Todos' || curso.nivel.toLowerCase() === filtroNivel.toLowerCase();
    const matchesPreco = filtroPreco === 'Todos' || (
      filtroPreco === 'Gratuito' ? curso.valor.toLowerCase() === 'gratuito' : curso.valor.toLowerCase() !== 'gratuito'
    );
    return matchesCategoria && matchesNivel && matchesPreco;
  });

  const temFiltroAtivo = filtroCategoria !== 'Todos' || filtroNivel !== 'Todos' || filtroPreco !== 'Todos';

  const limparFiltros = () => {
    setFiltroCategoria('Todos');
    setFiltroNivel('Todos');
    setFiltroPreco('Todos');
  };

  const verificarSessao = () => {
    const session = localStorage.getItem('user');
    if (!session) { navigate('/login'); return false; }
    return true;
  };

  const handleAbrirDetalhes = (curso) => setCursoParaDetalhes(curso);

  const handleFinalizarMatricula = (curso) => {
    const jaMatriculado = meusCursosMatriculados.find(c => c.id === curso.id);
    if (!jaMatriculado) {
      setMeusCursosMatriculados([...meusCursosMatriculados, { ...curso, progresso: 0 }]);
    }
    setCursoParaMatricula(null);
    setCursoParaDetalhes(null);
    setShowMeusCursosModal(true);
  };

  const user = JSON.parse(localStorage.getItem('user')) || { photo: null, name: 'Anny Gabrielly' };

  return (
    <div className="cursos-page-wrapper">

      <nav className="user-header">
        <div className="header-inner">
          <div className="header-left">
            <img src={logoImg} alt="Help Logo" className="header-logo" onClick={() => navigate('/feed')} />
            <div className="search-bar">
              <Search size={18} color="#9ca3af" />
              <input type="text" placeholder="Pesquisar treinamentos..." />
            </div>
          </div>

          <div className="header-right-nav">
            <Link to="/feed" className="nav-item">
              <Home size={22} /><span>Início</span>
            </Link>
            <Link to="/cursos" className="nav-item active">
              <BookOpen size={22} /><span>Cursos</span>
            </Link>
            <Link to="/vagas" className="nav-item">
              <Briefcase size={22} /><span>Vagas</span>
            </Link>
            <div className="nav-item" style={{ cursor: 'pointer' }}>
              <MessageSquare size={22} /><span>Mensagens</span>
            </div>
            <div className="nav-item" style={{ cursor: 'pointer' }}>
              <Bell size={22} /><span>Notificações</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="feed-content">

        <aside className="left-column">
          <div
            className="profile-card-dark"
            onClick={() => navigate('/configuracao-perfil')}
            style={{
              cursor: 'pointer', background: '#121217', borderRadius: '20px',
              border: '1px solid #333', padding: '20px', transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#a755f7'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#333'}
          >
            <div className="profile-header-info" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div className="avatar-preview-small" style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
                <div style={{
                  position: 'absolute', inset: '-3px', borderRadius: '18px',
                  background: 'linear-gradient(45deg, #a755f7, #6366f1)', zIndex: 0
                }} />
                <img
                  src={user.photo || logoImgperfil}
                  alt="Perfil"
                  style={{
                    width: '100%', height: '100%', borderRadius: '15px', objectFit: 'cover',
                    position: 'relative', zIndex: 1, border: '3px solid #121217'
                  }}
                />
              </div>
              <div className="user-details-text">
                <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '700' }}>{user.name}</h3>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0', lineHeight: '1.2' }}>
                  Systems Analyst na NTT DATA | Engenharia de Software
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} color="#9ca3af" />
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>Anápolis, Goiás</span>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '20px 0' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', background: 'white', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '5px', boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)'
              }}>
                <img src={nttLogo} alt="NTT DATA" style={{ maxWidth: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>NTT DATA</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="main-column">

          <div
            className="create-post-container"
            onClick={() => { if (verificarSessao()) setShowMeusCursosModal(true); }}
            style={{
              cursor: 'pointer', background: 'linear-gradient(145deg, #13131a, #1a1a24)',
              border: '1px solid #2d2d3a', transition: 'transform 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', color: 'white', margin: 0, fontWeight: '700' }}>Meus Cursos</h2>
                <p className="bio-text" style={{ margin: '5px 0 0 0' }}>Gerencie suas matrículas e progresso atual.</p>
              </div>
              <div style={{ background: 'rgba(167, 85, 247, 0.1)', padding: '10px', borderRadius: '12px' }}>
                <BookOpen size={24} color="#a755f7" />
              </div>
            </div>
          </div>

          <h3 style={{ color: 'white', margin: '25px 0 15px 5px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={18} color="#facc15" /> Sugestões para seu perfil
          </h3>

          <div
            className="post"
            style={{ padding: '20px', cursor: 'pointer', borderLeft: '4px solid #a755f7', background: '#13131a' }}
            onClick={() => handleAbrirDetalhes(novosCursosData[0])}
          >
            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="company-logo-box" style={{ width: '60px', height: '60px', background: '#fff', borderRadius: '12px', padding: '8px' }}>
                <img src={novosCursosData[0].foto} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ color: 'white', margin: 0, fontSize: '16px' }}>{novosCursosData[0].titulo}</h4>
                    <p className="bio-text" style={{ fontSize: '13px', marginTop: '4px' }}>Help Academy • Patrocinado por NTT DATA</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                    <span style={{
                      color: '#34d399', fontSize: '10px', fontWeight: 'bold',
                      background: 'rgba(52, 211, 153, 0.1)', padding: '4px 10px', borderRadius: '6px',
                      border: '1px solid rgba(52, 211, 153, 0.2)'
                    }}>
                      {novosCursosData[0].valor?.toUpperCase() || 'GRATUITO'}
                    </span>
                    <span style={{
                      fontSize: '9px', fontWeight: 'bold',
                      color: novosCursosData[0].limiteAcesso ? '#fb923c' : '#34d399',
                      display: 'flex', alignItems: 'center', gap: '3px'
                    }}>
                      <div style={{
                        width: '6px', height: '6px',
                        background: novosCursosData[0].limiteAcesso ? '#fb923c' : '#34d399',
                        borderRadius: '50%'
                      }} />
                      {novosCursosData[0].limiteAcesso ? novosCursosData[0].limiteAcesso.toUpperCase() : 'ILIMITADO'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span className="location-text" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={13} color="#9ca3af" /> {novosCursosData[0].nivel}
                    </span>
                    <span className="location-text" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={13} fill="#fbbf24" color="#fbbf24" /> 4.9
                    </span>
                    <span className="location-text" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {novosCursosData[0].duracao || '40h'}
                    </span>
                  </div>
                  <button className="publish-button" style={{ padding: '8px 20px', fontSize: '12px', height: 'auto', width: 'auto', borderRadius: '8px' }}>
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div //filtros
            className="create-post-container"
            style={{
              display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              width: '100%', boxSizing: 'border-box', marginTop: '35px', padding: '18px 25px',
              background: '#13131a', borderRadius: showFilters ? '12px 12px 0 0' : '12px', border: '1px solid #2d2d3a'
            }}
          >
            <h2 style={{ fontSize: '18px', color: 'white', margin: 0, fontWeight: '700' }}>
              Explorar Novos Treinamentos
            </h2>
            <div
              className="filter-trigger"
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#a755f7',
                padding: '8px 16px', borderRadius: '8px', background: 'rgba(167, 85, 247, 0.05)',
                border: '1px solid rgba(167, 85, 247, 0.1)', marginLeft: 'auto'
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Filtros</span>
              <Filter size={20} />
            </div>
          </div>

          {showFilters && (
            <div style={{
              background: '#0f0f1a', padding: '25px', borderRadius: '0 0 12px 12px',
              border: '1px solid #2d2d3a', borderTop: 'none', display: 'flex',
              flexDirection: 'column', gap: '20px', boxShadow: 'inset 0px 4px 20px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                {[
                  { label: 'CATEGORIA', value: filtroCategoria, setter: setFiltroCategoria, options: ['Todos|Todas as categorias', 'Programação|Programação', 'Cloud|Cloud', 'Soft Skills|Soft Skills', 'ServiceNow|ServiceNow'] },
                  { label: 'NÍVEL', value: filtroNivel, setter: setFiltroNivel, options: ['Todos|Todos os níveis', 'Iniciante|Iniciante', 'Intermediário|Intermediário', 'Avançado|Avançado'] },
                  { label: 'PREÇO', value: filtroPreco, setter: setFiltroPreco, options: ['Todos|Todos', 'Gratuito|Gratuito', 'Pago|Pago'] },
                ].map(({ label, value, setter, options }) => (
                  <div key={label} style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ color: '#a755f7', fontSize: '11px', display: 'block', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '1px' }}>{label}</label>
                    <select
                      value={value}
                      onChange={e => setter(e.target.value)}
                      style={{ width: '100%', background: '#161625', color: 'white', border: '1px solid #33334d', padding: '12px', borderRadius: '10px', outline: 'none', cursor: 'pointer' }}
                    >
                      {options.map(o => {
                        const [val, txt] = o.split('|');
                        return <option key={val} value={val}>{txt}</option>;
                      })}
                    </select>
                  </div>
                ))}
              </div>

              {temFiltroAtivo && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '15px', borderTop: '1px solid #2d2d3a' }}>
                  <button
                    onClick={limparFiltros}
                    style={{
                      background: 'rgba(248,113,113,0.1)', color: '#f87171',
                      border: '1px solid rgba(248,113,113,0.4)', padding: '8px 20px',
                      borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(248,113,113,0.2)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(248,113,113,0.1)'}
                  >
                    LIMPAR TODOS OS FILTROS
                  </button>
                </div>
              )}
            </div>
          )}

          {temFiltroAtivo && (
            <h3 style={{ color: 'white', fontSize: '16px', margin: '25px 0 15px 5px', fontWeight: '600' }}>
              Resultados ({cursosFiltrados.length})
            </h3>
          )}

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {cursosFiltrados.length > 0 ? (
              cursosFiltrados.map(curso => (
                <div
                  key={curso.id}
                  className="post"
                  style={{ padding: '18px', cursor: 'pointer', border: '1px solid #2d2d3a' }}
                  onClick={() => handleAbrirDetalhes(curso)}
                >
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="company-logo-box" style={{ width: '55px', height: '55px', background: '#fff', borderRadius: '10px', padding: '6px' }}>
                      <img src={curso.foto} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ color: 'white', margin: 0, fontSize: '15px', fontWeight: '600' }}>{curso.titulo}</h4>
                          <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>{curso.instrutor} • {curso.categoria}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{
                            fontSize: '9px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px',
                            color: curso.valor === 'Gratuito' ? '#34d399' : '#facc15',
                            background: curso.valor === 'Gratuito' ? 'rgba(52,211,153,0.1)' : 'rgba(250,204,21,0.1)',
                            border: `1px solid ${curso.valor === 'Gratuito' ? 'rgba(52,211,153,0.2)' : 'rgba(250,204,21,0.2)'}`
                          }}>
                            {curso.valor === 'Gratuito' ? 'GRATUITO' : (curso.preco || 'PAGO')}
                          </span>
                          <span style={{ fontSize: '9px', fontWeight: 'bold', color: curso.isIlimitado ? '#34d399' : '#f87171' }}>
                            ● {curso.isIlimitado ? 'ILIMITADO' : `LIMITE: ${curso.dataLimite || '31/12'}`}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '15px', marginTop: '10px', alignItems: 'center' }}>
                        <span className="location-text" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={12} color="#9ca3af" /> {curso.nivel}
                        </span>
                        <span className="location-text" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={12} fill="#fbbf24" color="#fbbf24" /> 4.9
                        </span>
                        <span className="location-text" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {curso.duracao}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 40px', background: '#121217', borderRadius: '20px', border: '1px dashed #333' }}>
                <Search size={40} color="#333" style={{ marginBottom: '15px' }} />
                <p style={{ color: '#9ca3af', margin: 0, fontSize: '15px' }}>Nenhum treinamento encontrado para os filtros selecionados.</p>
                <button
                  onClick={limparFiltros}
                  style={{ marginTop: '15px', background: 'none', border: 'none', color: '#a755f7', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
                >
                  Ver todos os cursos
                </button>
              </div>
            )}
          </div>
        </section>

        <aside className="right-column">
          <div
            className="profile-card-dark"
            style={{
              border: '1px solid rgba(167,85,247,0.3)', padding: '20px',
              borderRadius: '15px', background: '#13131a', position: 'sticky', top: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <TrendingUp size={18} color="#a755f7" />
              <h3 style={{ color: 'white', fontSize: '12px', margin: 0, fontWeight: '800', letterSpacing: '0.5px' }}>DESTAQUE DA SEMANA</h3>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'white', padding: '12px', borderRadius: '12px',
                display: 'inline-block', marginBottom: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
              }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" alt="AWS" style={{ width: '45px', display: 'block' }} />
              </div>
              <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '4px', fontWeight: '700' }}>Arquitetura Cloud AWS</h4>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '20px' }}>Tendência global em Cloud Computing.</p>

              <div style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '15px 10px',
                marginBottom: '20px', border: '1px solid #2d2d3a', display: 'flex', justifyContent: 'space-around'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', color: '#a755f7', fontSize: '14px', fontWeight: 'bold' }}>1.2k</span>
                  <span style={{ color: '#6b7280', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Iniciaram</span>
                </div>
                <div style={{ width: '1px', background: '#2d2d3a', height: '25px', alignSelf: 'center' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', color: 'white', fontSize: '14px', fontWeight: 'bold' }}>5.8k</span>
                  <span style={{ color: '#6b7280', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Pesquisas</span>
                </div>
                <div style={{ width: '1px', background: '#2d2d3a', height: '25px', alignSelf: 'center' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>430</span>
                  <span style={{ color: '#6b7280', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }}>Finalizaram</span>
                </div>
              </div>

              <button
                className="publish-button"
                style={{ width: '100%', height: '42px', borderRadius: '8px', fontWeight: 'bold' }}
                onClick={() => handleAbrirDetalhes(novosCursosData[1])}
              >
                Explorar Agora
              </button>
            </div>
          </div>
        </aside>
      </main>

      {cursoParaDetalhes && !cursoParaMatricula && (//modal detalhes
        <DetalhesCursoModal
          curso={{ ...cursoParaDetalhes, descricao: cursoParaDetalhes.descricao || 'Este treinamento oferece uma imersão completa nos fundamentos e práticas avançadas da área.' }}
          onFechar={() => setCursoParaDetalhes(null)}
          onMatricular={c => setCursoParaMatricula(c)}
        />
      )}

      {cursoParaMatricula && ( //modal matricula
        <MatriculaForm
          curso={cursoParaMatricula}
          usuarioDados={user}
          onFechar={() => setCursoParaMatricula(null)}
          onFinalizar={handleFinalizarMatricula}
        />
      )}

      {showMeusCursosModal && ( //meus cursos
        <div className="modal-overlay" onClick={() => setShowMeusCursosModal(false)}>
          <div
            className="create-post-modal"
            onClick={e => e.stopPropagation()}
            style={{ width: '680px', background: '#13131a', borderRadius: '20px', overflow: 'hidden', border: '1px solid #2d2d3a' }}
          >
            <div className="modal-header" style={{ padding: '25px', borderBottom: '1px solid #2d2d3a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOpen size={22} color="#a755f7" />
                <h3 style={{ color: 'white', margin: 0, fontSize: '20px' }}>Meus Cursos</h3>
              </div>
              <button
                onClick={() => setShowMeusCursosModal(false)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex' }}
              >
                <X size={20} color="white" />
              </button>
            </div>

            <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              {meusCursosMatriculados.length > 0 ? (
                meusCursosMatriculados.map(curso => (
                  <div
                    key={curso.id}
                    className="post"
                    style={{ marginBottom: '10px', cursor: 'pointer', border: '1px solid #2d2d3a', background: '#0f0f14' }}
                    onClick={() => setCursoSelecionadoProgresso(curso)}
                  >
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <img src={curso.foto} alt={curso.titulo} style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fff', padding: '4px', objectFit: 'contain' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <p style={{ color: 'white', margin: 0, fontWeight: '600' }}>{curso.titulo}</p>
                          <span style={{ color: '#a755f7', fontWeight: 'bold', fontSize: '13px' }}>{curso.progresso}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2px 0 6px' }}>
                          <p style={{ color: '#9ca3af', margin: 0, fontSize: '12px' }}>{curso.instrutor}</p>
                          <span style={{ fontSize: '9px', fontWeight: 'bold', color: curso.limiteAcesso ? '#fb923c' : '#34d399', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <div style={{ width: '5px', height: '5px', background: curso.limiteAcesso ? '#fb923c' : '#34d399', borderRadius: '50%' }} />
                            {curso.limiteAcesso ? curso.limiteAcesso.toUpperCase() : 'ILIMITADO'}
                          </span>
                        </div>
                        <div style={{ height: '6px', background: '#2d2d3a', borderRadius: '3px' }}>
                          <div style={{ width: `${curso.progresso}%`, background: '#a755f7', height: '100%', borderRadius: '3px' }} />
                        </div>
                      </div>
                      <ChevronRight size={18} color="#666" style={{ marginLeft: '10px' }} />
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>Você ainda não possui cursos matriculados.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {cursoSelecionadoProgresso && ( //model progresso do curso
          <div className="modal-overlay" onClick={() => setCursoSelecionadoProgresso(null)}>
          <div
            className="create-post-modal"
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '620px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#13131a', borderRadius: '20px', border: '1px solid #333' }}
          >
            <div className="modal-header" style={{ padding: '20px 30px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '600' }}>Detalhes do Treinamento</h3>
              <button onClick={() => setCursoSelecionadoProgresso(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                <X size={22} color="white" />
              </button>
            </div>

            <div className="modal-content" style={{ padding: '25px 30px 30px', overflowY: 'auto' }}>
              <div style={{
                display: 'flex', gap: '20px', marginBottom: '25px', alignItems: 'center',
                width: '100%', background: 'rgba(167,85,247,0.08)', padding: '16px',
                borderRadius: '14px', border: '1px solid rgba(167,85,247,0.15)', boxSizing: 'border-box'
              }}>
                <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '12px', padding: '8px', flexShrink: 0 }}>
                  <img src={cursoSelecionadoProgresso.foto} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '20px', fontWeight: '700' }}>{cursoSelecionadoProgresso.titulo}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <p style={{ color: '#a755f7', fontSize: '14px', margin: 0, fontWeight: '500' }}>{cursoSelecionadoProgresso.instrutor}</p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        color: '#34d399', fontSize: '9px', fontWeight: 'bold',
                        background: 'rgba(52,211,153,0.1)', padding: '2px 8px', borderRadius: '4px',
                        border: '1px solid rgba(52,211,153,0.2)', textTransform: 'uppercase'
                      }}>
                        {cursoSelecionadoProgresso.valor || 'GRATUITO'}
                      </span>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', color: cursoSelecionadoProgresso.limiteAcesso ? '#fb923c' : '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '5px', height: '5px', background: cursoSelecionadoProgresso.limiteAcesso ? '#fb923c' : '#34d399', borderRadius: '50%' }} />
                        {cursoSelecionadoProgresso.limiteAcesso ? cursoSelecionadoProgresso.limiteAcesso.toUpperCase() : 'ACESSO ILIMITADO'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '12px', alignItems: 'center' }}>
                    <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={14} color="#9ca3af" /> {cursoSelecionadoProgresso.nivel || 'Avançado'}
                    </span>
                    <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={14} fill="#fbbf24" color="#fbbf24" /> 4.9
                    </span>
                    <span style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {cursoSelecionadoProgresso.duracao || '40h'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '25px', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: '1px solid #2d2d3a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ color: 'white', margin: 0, fontSize: '14px', fontWeight: '600' }}>Seu Progresso Atual</h4>
                  <span style={{ color: '#a755f7', fontWeight: 'bold', fontSize: '16px' }}>{cursoSelecionadoProgresso.progresso}%</span>
                </div>
                <div style={{ height: '8px', background: '#2d2d3a', borderRadius: '4px' }}>
                  <div style={{ width: `${cursoSelecionadoProgresso.progresso}%`, background: '#a755f7', height: '100%', borderRadius: '4px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: 'white', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Info size={18} color="#a755f7" /> Sobre o treinamento
                </h4>
                <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                  {cursoSelecionadoProgresso.descricao || 'Domine o framework Java mais utilizado no mercado. Neste treinamento, você aprenderá desde a configuração do ambiente até o deploy de APIs REST seguras e escaláveis utilizando Spring Boot, JPA e AWS.'}
                </p>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: 'white', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <BookText size={18} color="#a755f7" /> Grade Curricular
                </h4>
                {(cursoSelecionadoProgresso.modulos || ['Setup e Spring Initializr', 'JPA e Hibernate', 'Spring Security', 'Documentação com Swagger', 'Deploy AWS']).map((modulo, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center',
                    background: '#1c1c24', padding: '12px 15px',
                    borderRadius: '0 10px 10px 0',
                    marginBottom: '8px', borderLeft: '3px solid #a755f7',
                    color: '#e5e7eb', fontSize: '13px', boxSizing: 'border-box',
                  }}>
                    {modulo}
                  </div>
                ))}
              </div>

              <button className="publish-button" style={{ marginTop: '10px', width: '100%', height: '48px', fontWeight: 'bold', fontSize: '15px' }}>
                Continuar Aula
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Cursos;
export const CHAVES_PRIVADAS = [
  'helpRecentSearches',
  'favoritosTalentosRH',
  'convidadosTalentosRH',
  'entrevistasTalentosRH'
];

const CHAVE_ULTIMA_CONTA = 'helpUltimaConta';

const identificarConta = (conta) => {
  if (!conta || !conta.id) return null;
  return `${String(conta.tipoConta || 'USUARIO').toUpperCase()}:${conta.id}`;
};

export function limparDadosPrivados() {
  CHAVES_PRIVADAS.forEach((chave) => localStorage.removeItem(chave));
}

export function obterSessao() {
  try {
    const token = localStorage.getItem('token');
    const conta = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
    const sessaoDaAba = sessionStorage.getItem('helpTabSessionId');
    return token && conta && sessaoDaAba === conta.sessaoId ? { token, conta } : null;
  } catch {
    return null;
  }
}

export function estabelecerSessao(token, conta) {
  const novaConta = identificarConta(conta);
  if (localStorage.getItem(CHAVE_ULTIMA_CONTA) !== novaConta) limparDadosPrivados();

  const sessaoId = crypto.randomUUID();
  const contaCompleta = { ...conta, token, sessaoId };
  localStorage.setItem('token', token);
  localStorage.setItem('usuarioLogado', JSON.stringify(contaCompleta));
  if (novaConta) localStorage.setItem(CHAVE_ULTIMA_CONTA, novaConta);
  sessionStorage.setItem('helpTabSessionId', sessaoId);
  localStorage.setItem('helpSessionEvent', JSON.stringify({ sessaoId, at: Date.now() }));
  return contaCompleta;
}

export function encerrarSessao(motivo = 'logout') {
  let contaGlobal = null;
  try {
    contaGlobal = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
  } catch {
    contaGlobal = null;
  }
  const sessaoDaAba = sessionStorage.getItem('helpTabSessionId');
  sessionStorage.removeItem('helpTabSessionId');
  if (!contaGlobal || contaGlobal.sessaoId === sessaoDaAba) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem(CHAVE_ULTIMA_CONTA);
    limparDadosPrivados();
    localStorage.setItem('helpSessionEvent', JSON.stringify({ motivo, at: Date.now() }));
  }
}

export function sessaoAtualDaAba() {
  return sessionStorage.getItem('helpTabSessionId');
}

export function observarSessao(callback) {
  const chavesDaSessao = new Set(['token', 'usuarioLogado', 'helpSessionEvent']);
  const handler = (event) => {
    if (event.key && chavesDaSessao.has(event.key)) callback(obterSessao());
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
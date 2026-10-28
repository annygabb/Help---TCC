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
  const sessaoId = crypto.randomUUID();
  const contaCompleta = { ...conta, token, sessaoId };
  localStorage.setItem('token', token);
  localStorage.setItem('usuarioLogado', JSON.stringify(contaCompleta));
  sessionStorage.setItem('helpTabSessionId', sessaoId);
  localStorage.setItem('helpSessionEvent', JSON.stringify({ sessaoId, at: Date.now() }));
  return contaCompleta;
}

export function encerrarSessao(motivo = 'logout') {
  const contaGlobal = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
  const sessaoDaAba = sessionStorage.getItem('helpTabSessionId');
  sessionStorage.removeItem('helpTabSessionId');
  if (!contaGlobal || contaGlobal.sessaoId === sessaoDaAba) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioLogado');
    localStorage.setItem('helpSessionEvent', JSON.stringify({ motivo, at: Date.now() }));
  }
}

export function observarSessao(callback) {
  const chavesDaSessao = new Set(['token', 'usuarioLogado', 'helpSessionEvent']);
  const handler = (event) => {
    if (event.key && chavesDaSessao.has(event.key)) callback(obterSessao());
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

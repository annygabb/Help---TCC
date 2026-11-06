export const avatarPadrao = (nome = 'Usuário') => {
  const iniciais = String(nome).trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase() || 'U';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="80" fill="#3b2468"/><circle cx="80" cy="58" r="27" fill="none" stroke="#c4b5fd" stroke-width="8"/><path d="M31 137c5-29 24-44 49-44s44 15 49 44" fill="none" stroke="#c4b5fd" stroke-width="8" stroke-linecap="round"/><text x="80" y="151" text-anchor="middle" fill="#ede9fe" font-family="Arial" font-size="18" font-weight="700">${iniciais}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};


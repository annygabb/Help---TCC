// Usado somente nos cartões compactos; o nome completo continua no perfil.
export function nomeCurto(nome) {
  const partes = (typeof nome === 'string' ? nome : '').trim().split(/\s+/).filter(Boolean);
  if (partes.length < 2) return partes[0] || 'Usuário';
  const proxima = partes.slice(1).find((parte) => !/^(de|da|das|do|dos|e)$/i.test(parte));
  return proxima ? `${partes[0]} ${proxima}` : partes[0];
}

export const apenasDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

export function formatarCPF(valor) {
  return apenasDigitos(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function validarCPF(valor) {
  const cpf = apenasDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digito = (base, peso) => {
    const soma = [...base].reduce((total, n, index) => total + Number(n) * (peso - index), 0);
    const resto = (soma * 10) % 11;
    return resto >= 10 ? 0 : resto;
  };
  return digito(cpf.slice(0, 9), 10) === Number(cpf[9])
    && digito(cpf.slice(0, 10), 11) === Number(cpf[10]);
}

export function mensagemDaApi(error, padrao) {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  return data?.mensagem || data?.message || data?.error || padrao;
}

export const REQUISITOS_SENHA = [
  { id: 'tamanho', texto: 'Pelo menos 8 caracteres', testar: (senha) => senha.length >= 8 },
  { id: 'maiuscula', texto: 'Uma letra maiúscula', testar: (senha) => /[A-Z]/.test(senha) },
  { id: 'minuscula', texto: 'Uma letra minúscula', testar: (senha) => /[a-z]/.test(senha) },
  { id: 'numero', texto: 'Um número', testar: (senha) => /\d/.test(senha) }
];

export function verificarSenha(valor) {
  const senha = String(valor ?? '');
  return REQUISITOS_SENHA.map(({ id, texto, testar }) => ({ id, texto, atendido: testar(senha) }));
}

export function senhaValida(valor) {
  return verificarSenha(valor).every((requisito) => requisito.atendido);
}

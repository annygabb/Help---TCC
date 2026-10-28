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

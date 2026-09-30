export function apenasDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

export function formatarCPF(valor) {
  const d = apenasDigitos(valor).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}


export function validarCPF(valor) {
  const cpf = apenasDigitos(valor);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcularDigito = (base, pesoInicial) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 || resto === 11 ? 0 : resto;
  };

  if (calcularDigito(cpf.slice(0, 9), 10) !== Number(cpf[9])) return false;
  return calcularDigito(cpf.slice(0, 10), 11) === Number(cpf[10]);
}

export function validarSenha(senha) {
  const s = String(senha ?? '');
  if (s.length < 8 || s.length > 64) return false;
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(s);
}


export function motivoSenhaInvalida(senha) {
  const s = String(senha ?? '');
  if (s.length === 0) return 'A senha é obrigatória.';
  if (s.length < 8) return 'A senha deve ter no mínimo 8 caracteres.';
  if (s.length > 64) return 'A senha deve ter no máximo 64 caracteres.';
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(s)) {
    return 'A senha deve conter ao menos uma letra maiúscula, uma letra minúscula e um número.';
  }
  return '';
}


export function validarEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(email ?? '').trim());
}


export function validarCNPJ(valor) {
  const cnpj = apenasDigitos(valor);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcular = (base) => {
    let peso = base.length - 7;
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * peso;
      peso -= 1;
      if (peso < 2) peso = 9;
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  if (calcular(cnpj.slice(0, 12)) !== Number(cnpj[12])) return false;
  return calcular(cnpj.slice(0, 13)) === Number(cnpj[13]);
}

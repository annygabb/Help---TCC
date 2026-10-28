const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function contaIdValido(valor) {
  return typeof valor === 'string' && UUID_PATTERN.test(valor.trim());
}

export function normalizarContato(contato) {
  if (!contato || typeof contato !== 'object') return null;

  const contaId = contato.contaId
    || contato.id
    || contato.usuarioId
    || contato.empresaId
    || contato.origemId
    || contato.remetenteId;

  if (!contaIdValido(contaId)) return null;

  const tipoInformado = contato.tipoConta
    || contato.tipo
    || contato.origemTipo
    || contato.remetenteTipo
    || contato.tipoDestinatario;
  const tipoConta = String(tipoInformado || (contato.empresaId || contato.cnpj ? 'EMPRESA' : 'USUARIO')).toUpperCase();

  if (!['USUARIO', 'EMPRESA'].includes(tipoConta)) return null;

  return {
    ...contato,
    contaId: contaId.trim(),
    tipoConta,
    nome: contato.nome || contato.name || contato.corporateName || contato.nomeEmpresa || 'Conta'
  };
}

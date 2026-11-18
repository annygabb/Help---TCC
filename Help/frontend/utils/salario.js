/** Valor inicial de um salário em reais; uma faixa usa seu primeiro valor. */
export function salarioInicial(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor) && valor >= 0 ? valor : 0;
  const primeiro = String(valor || '').match(/\d[\d.,]*/)?.[0];
  if (!primeiro) return 0;
  let texto = primeiro;
  if (texto.includes(',')) texto = texto.replace(/\./g, '').replace(',', '.');
  else if (/\.\d{3}(?:\.|$)/.test(texto)) texto = texto.replace(/\./g, '');
  const numero = Number(texto);
  return Number.isFinite(numero) && numero >= 0 ? numero : 0;
}

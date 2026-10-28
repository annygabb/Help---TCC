const texto = (valor) => typeof valor === 'string' ? valor.trim() : '';

export function normalizarPerfilAtual(dados = {}, tipoInformado = 'USUARIO') {
  const tipoConta = String(tipoInformado || dados.tipoConta || 'USUARIO').toUpperCase();

  if (tipoConta === 'EMPRESA') {
    return {
      nome: texto(dados.razaoSocial || dados.corporateName || dados.nome),
      cargo: 'Empresa',
      localidade: texto(dados.localidade || dados.cidade),
      fotoUrl: dados.fotoUrl || dados.fotoPerfil || null,
      empresaAtual: '',
      tipoConta: 'EMPRESA'
    };
  }

  const experiencias = Array.isArray(dados.experiencias) ? dados.experiencias : [];
  const empregoAtual = experiencias.find((experiencia) =>
    experiencia?.trabalhaAtualmente === true || experiencia?.atual === true
  );

  return {
    nome: texto(dados.nome || dados.name),
    cargo: texto(dados.cargo),
    localidade: texto(dados.localidade || dados.cidade),
    fotoUrl: dados.fotoUrl || dados.fotoPerfil || dados.photo || null,
    empresaAtual: texto(empregoAtual?.empresa),
    tipoConta: 'USUARIO'
  };
}

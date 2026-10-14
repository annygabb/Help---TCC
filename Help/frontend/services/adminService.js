import api from './api';

const comToken = (extra = {}) => {
  const token = localStorage.getItem('token');
  return {
    ...extra,
    headers: { ...(extra.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  };
};

const semVazios = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, valor]) => valor !== '' && valor !== null && valor !== undefined));

const normalizarPagina = (data) => ({
  itens: data?.content ?? [],
  pagina: data?.number ?? 0,
  totalPaginas: data?.totalPages ?? 0,
  totalItens: data?.totalElements ?? 0,
});

export const buscarContaAtual = () => api.get('/auth/me', comToken()).then((r) => r.data);

export const buscarResumo = () => api.get('/admin/resumo', comToken()).then((r) => r.data);

export const listarContas = ({ busca, tipo, status, pagina = 0, tamanho = 10 }) =>
  api
    .get('/admin/contas', comToken({ params: semVazios({ busca, tipo, status, page: pagina, size: tamanho }) }))
    .then((r) => normalizarPagina(r.data));

export const buscarConta = (id) => api.get(`/admin/contas/${id}`, comToken()).then((r) => r.data);

export const alterarStatusConta = (id, ativo) =>
  api.patch(`/admin/contas/${id}/status`, { ativo }, comToken()).then((r) => r.data);

export const listarEmpresas = ({ busca, status, pagina = 0, tamanho = 10 }) =>
  api
    .get('/admin/empresas', comToken({ params: semVazios({ busca, status, page: pagina, size: tamanho }) }))
    .then((r) => normalizarPagina(r.data));

export const buscarEmpresa = (id) => api.get(`/admin/empresas/${id}`, comToken()).then((r) => r.data);

export const alterarStatusEmpresa = (id, ativo) =>
  api.patch(`/admin/empresas/${id}/status`, { ativo }, comToken()).then((r) => r.data);

export const encerrarSessao = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuarioLogado');
};

export const mensagemDeErro = (erro, padrao) => {
  const status = erro?.response?.status;
  const corpo = erro?.response?.data;
  if (corpo && typeof corpo === 'object' && (corpo.mensagem || corpo.error)) return corpo.mensagem || corpo.error;
  if (typeof corpo === 'string' && corpo.trim() && corpo.length < 200) return corpo;
  if (status === 401) return 'Sua sessão expirou. Entre novamente.';
  if (status === 403) return 'Você não tem permissão para esta ação.';
  if (status === 404) return 'Registro não encontrado.';
  if (!erro?.response) return 'Não foi possível conectar ao servidor.';
  return padrao;
};

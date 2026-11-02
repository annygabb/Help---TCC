import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import { encerrarSessao, sessaoAtualDaAba } from './session';

const api = axios.create({
  baseURL: API_BASE_URL
});

const sessaoMudou = (config) =>
  Boolean(config?.helpSessaoId) && config.helpSessaoId !== sessaoAtualDaAba();

const respostaDescartada = (config) => {
  const erro = new axios.CanceledError('A sessão mudou antes da resposta chegar.');
  erro.config = config;
  return Promise.reject(erro);
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.helpSessaoId = sessaoAtualDaAba();
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (sessaoMudou(response.config)) return respostaDescartada(response.config);
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    if (sessaoMudou(error.config)) return respostaDescartada(error.config);
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      encerrarSessao('sessao-expirada-ou-substituida');
      if (!window.location.hash.includes('/login')) window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

export default api;
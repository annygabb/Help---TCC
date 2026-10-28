import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import { encerrarSessao } from './session';

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      encerrarSessao('sessao-expirada-ou-substituida');
      if (!window.location.hash.includes('/login')) window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

export default api;

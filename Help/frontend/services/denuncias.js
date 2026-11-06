import api from './api';

export const criarDenuncia = (dados) => api.post('/denuncias', dados).then((r) => r.data);
export const listarMinhasDenuncias = () => api.get('/denuncias/minhas').then((r) => r.data);


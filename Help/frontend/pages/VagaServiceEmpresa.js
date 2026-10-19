import api from '../services/api';

const API_URL = '/api/vagas';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token || token === "null" || token === "undefined") {
            return {};
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const vagaService = {
    listarTodas: () => api.get(API_URL, {
        headers: getAuthHeader()
    }),

    criar: (vaga) => api.post(API_URL, vaga, {
        headers: getAuthHeader()
    }),

    deletar: (id) => api.delete(`${API_URL}/${id}`, {
        headers: getAuthHeader()
    })
};

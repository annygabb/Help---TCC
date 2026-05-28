import axios from 'axios';

const API_URL = "http://localhost:8080/api/vagas";

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token || token === "null" || token === "undefined") {
            return {};
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const vagaService = {
    listarTodas: () => axios.get(API_URL, {
        headers: getAuthHeader()
    }),

    criar: (vaga) => axios.post(API_URL, vaga, {
        headers: getAuthHeader()
    }),

    deletar: (id) => axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeader()
    })
};
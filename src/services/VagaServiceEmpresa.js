import axios from 'axios';

const API_URL = "http://localhost:8080/api/vagas";

export const vagaService = {
    listarTodas: () => axios.get(API_URL),
    criar: (vaga) => axios.post(API_URL, vaga),
    deletar: (id) => axios.delete(`${API_URL}/${id}`)
};
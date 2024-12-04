import axios from 'axios';

// Definindo a URL do backend - usamos o nome do serviço do docker-compose
const API_URL = 'http://localhost:5000'; // 'backend' é o nome do serviço no docker-compose.yml

// Função para pegar dados de um endpoint
export const fetchData = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/some-endpoint`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados', error);
    throw error;
  }
};

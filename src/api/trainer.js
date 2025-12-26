import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

export const getTrainer = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/trainer`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const assignTrainer = async (token, name) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/trainer`, { name }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const updateTrainer = async (token, instructions) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/trainer`, { instructions }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
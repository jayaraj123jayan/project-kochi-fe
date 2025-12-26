import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`/login`, { email, password });
    return response.data; // Assume it returns user object
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
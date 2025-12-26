import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

export const getWorkouts = async (token) => {
  try {
    const response = await axios.get(`/workouts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const updateWorkouts = async (token, plans) => {
  try {
    const response = await axios.post(`/workouts`, { plans }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
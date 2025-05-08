import axios from 'axios';
import { CeremonyStep } from '../context/FuneralContext';

const API_URL = '/api/funerals';

// Funeral data structure for API
export interface FuneralData {
  title: string;
  scene: string;
  steps: CeremonyStep[];
}

// Response structure from API
export interface FuneralResponse {
  _id: string;
  organizerId: string;
  title: string;
  scene: string;
  steps: CeremonyStep[];
  createdAt: string;
  updatedAt: string;
}

// Get the JWT token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create a new funeral
export const createFuneral = async (funeralData: FuneralData) => {
  const response = await axios.post<FuneralResponse>(
    API_URL,
    funeralData,
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Get a funeral by ID
export const getFuneral = async (id: string) => {
  const response = await axios.get<FuneralResponse>(
    `${API_URL}/${id}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Update a funeral
export const updateFuneral = async (id: string, funeralData: Partial<FuneralData>) => {
  const response = await axios.put<FuneralResponse>(
    `${API_URL}/${id}`,
    funeralData,
    { headers: getAuthHeader() }
  );
  return response.data;
};

// Delete a funeral
export const deleteFuneral = async (id: string) => {
  await axios.delete(
    `${API_URL}/${id}`,
    { headers: getAuthHeader() }
  );
  return true;
};

// Get all funerals for the current organizer
export const getOrganizerFunerals = async () => {
  const response = await axios.get<FuneralResponse[]>(
    API_URL,
    { headers: getAuthHeader() }
  );
  return response.data;
}; 
// Database service for funeral rooms
// This service provides functions to save and load funeral room data using MongoDB API

import axios from 'axios';

// Base API URL
const API_URL = 'http://localhost:5001/api/funerals';

// Interface for funeral room data
export interface FuneralRoom {
  roomId: string;
  password: string;
  deceasedName: string;
  funeralType: string;
  backgroundImage: string;
  deceasedImage?: string;
  canvasItems?: any[]; // For storing items on the canvas
  createdAt: number;
  updatedAt: number;
}

// Canvas item interface
export interface CanvasItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  name: string;
  image?: string;
}

// Get all funeral rooms from database (admin only, should be authenticated)
export const getAllFuneralRooms = async (): Promise<FuneralRoom[]> => {
  try {
    // This is a placeholder - in a real app, this would require authentication
    console.warn('getAllFuneralRooms is just a placeholder in this implementation');
    return [];
  } catch (error) {
    console.error('Error getting funeral rooms:', error);
    return [];
  }
};

// Create or update a funeral room
export const saveFuneralRoom = async (room: FuneralRoom): Promise<FuneralRoom> => {
  try {
    // Map frontend type keys to backend enum values if needed
    const sceneTypeMapping: Record<string, string> = {
      'church': 'Church Funeral',
      'garden': 'Garden Funeral', 
      'forest': 'Forest Funeral',
      'seaside': 'Seaside Funeral',
      'starryNight': 'Starry Night Funeral',
      'chineseTraditional': 'Chinese Traditional Funeral'
    };

    // Use mapped value if available, otherwise use the original
    const sceneType = sceneTypeMapping[room.funeralType] || room.funeralType;

    const response = await axios.post(`${API_URL}/room`, {
      roomId: room.roomId,
      password: room.password,
      deceasedName: room.deceasedName,
      funeralType: sceneType,
      backgroundImage: room.backgroundImage,
      deceasedImage: room.deceasedImage,
      canvasItems: room.canvasItems,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error saving funeral room:', error);
    throw new Error('Failed to save funeral room');
  }
};

// Get a funeral room by ID
export const getFuneralRoomById = async (roomId: string, password?: string): Promise<FuneralRoom | null> => {
  try {
    const url = password 
      ? `${API_URL}/room/${roomId}?password=${encodeURIComponent(password)}` 
      : `${API_URL}/room/${roomId}`;
      
    const response = await axios.get(url);
    
    // Convert MongoDB data to FuneralRoom interface
    const data = response.data;

    // Map backend enum values to frontend type keys if needed
    const typeMapping: Record<string, string> = {
      'Church Funeral': 'church',
      'Garden Funeral': 'garden',
      'Forest Funeral': 'forest',
      'Seaside Funeral': 'seaside',
      'Starry Night Funeral': 'starryNight',
      'Chinese Traditional Funeral': 'chineseTraditional'
    };

    // Use the mapped value if available, otherwise use the original
    const funeralType = typeMapping[data.sceneType] || data.sceneType;

    return {
      roomId: data.stringId || data._id,
      password: data.password,
      deceasedName: data.deceasedName,
      funeralType: funeralType,
      backgroundImage: data.backgroundImage,
      deceasedImage: data.deceasedImage,
      canvasItems: data.canvasItems,
      createdAt: new Date(data.createdAt).getTime(),
      updatedAt: new Date(data.updatedAt).getTime(),
    };
  } catch (error) {
    console.error('Error getting funeral room:', error);
    return null;
  }
};

// Update canvas items only
export const updateCanvasItems = async (roomId: string, canvasItems: CanvasItem[], password?: string): Promise<boolean> => {
  try {
    const url = password 
      ? `${API_URL}/room/${roomId}/canvas?password=${encodeURIComponent(password)}`
      : `${API_URL}/room/${roomId}/canvas`;
    
    await axios.patch(url, { canvasItems });
    return true;
  } catch (error) {
    console.error('Error updating canvas items:', error);
    return false;
  }
};

// Delete a funeral room
export const deleteFuneralRoom = async (roomId: string): Promise<boolean> => {
  try {
    // This is just a placeholder - in a real app with authentication
    // we would implement proper deletion via API
    console.warn('deleteFuneralRoom is just a placeholder in this implementation');
    return false;
  } catch (error) {
    console.error('Error deleting funeral room:', error);
    return false;
  }
}; 
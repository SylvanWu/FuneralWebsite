// Database service for funeral rooms
// This service provides functions to save and load funeral room data using MongoDB API

import axios from 'axios';

// Base API URL - use environment variable if available, otherwise fallback to default
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/funerals` 
  : 'http://localhost:5001/api/funerals';

console.log('Using API URL:', API_URL);

// Interface for funeral room data
export interface FuneralRoom {
  roomId: string;
  password: string;
  deceasedName: string;
  title?: string;
  funeralType: string;
  backgroundImage: string;
  deceasedImage?: string;
  canvasItems?: any[]; // For storing items on the canvas
  isOrganizer?: boolean;
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

// Add timeout and headers to requests
const axiosConfig = {
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json'
  }
};

// Check server health
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const baseUrl = API_URL.split('/api/funerals')[0];
    await axios.get(`${baseUrl}/api/health`, { timeout: 5000 });
    return true;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
};

// Get all funeral rooms from database (admin only, should be authenticated)
export const getAllFuneralRooms = async (): Promise<FuneralRoom[]> => {
  try {
    console.log(`Fetching funeral rooms from: ${API_URL}/rooms`);
    const startTime = Date.now();
    
    const response = await axios.get(`${API_URL}/rooms`, axiosConfig);
    
    console.log(`API response time: ${Date.now() - startTime}ms`);
    console.log('API response status:', response.status);
    
    if (!response.data || !Array.isArray(response.data)) {
      console.error('Invalid response format:', response.data);
      return [];
    }
    
    // Convert response data to FuneralRoom interface
    return response.data.map((room: any) => {
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
      const funeralType = typeMapping[room.sceneType] || room.sceneType;
      
      return {
        roomId: room.stringId || room._id,
        password: room.password,
        deceasedName: room.deceasedName || 'Unknown',
        funeralType: funeralType,
        backgroundImage: room.backgroundImage || '',
        deceasedImage: room.deceasedImage || '',
        canvasItems: room.canvasItems || [],
        createdAt: new Date(room.createdAt || Date.now()).getTime(),
        updatedAt: new Date(room.updatedAt || Date.now()).getTime(),
      };
    });
  } catch (error: any) {
    console.error('Error getting funeral rooms:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: `${API_URL}/rooms`
    });
    
    // Return empty array to prevent UI crashes
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

    console.log(`Saving funeral room: ${room.roomId}`);
    const response = await axios.post(`${API_URL}/room`, {
      roomId: room.roomId,
      password: room.password,
      deceasedName: room.deceasedName,
      funeralType: sceneType,
      backgroundImage: room.backgroundImage,
      deceasedImage: room.deceasedImage,
      canvasItems: room.canvasItems,
    }, axiosConfig);
    
    return response.data;
  } catch (error: any) {
    console.error('Error saving funeral room:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw new Error(`Failed to save funeral room: ${error.message}`);
  }
};

// Get a funeral room by ID
export const getFuneralRoomById = async (roomId: string, password?: string): Promise<FuneralRoom | null> => {
  try {
    const url = password 
      ? `${API_URL}/room/${roomId}?password=${encodeURIComponent(password)}` 
      : `${API_URL}/room/${roomId}`;
    
    console.log(`Fetching funeral room by ID: ${roomId}`);  
    const response = await axios.get(url, axiosConfig);
    
    // Convert MongoDB data to FuneralRoom interface
    const data = response.data;
    
    console.log('[getFuneralRoomById] Raw API response:', {
      roomId: data.stringId || data._id,
      deceasedName: data.deceasedName,
      sceneType: data.sceneType,
      isOrganizer: data.isOrganizer
    });

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

    const result = {
      roomId: data.stringId || data._id,
      password: data.password,
      deceasedName: data.deceasedName,
      title: data.title,
      funeralType: funeralType,
      backgroundImage: data.backgroundImage || '',
      deceasedImage: data.deceasedImage || '',
      canvasItems: data.canvasItems || [],
      isOrganizer: data.isOrganizer || false,
      createdAt: new Date(data.createdAt).getTime(),
      updatedAt: new Date(data.updatedAt).getTime(),
    };

    console.log('[getFuneralRoomById] Converted room data:', {
      roomId: result.roomId,
      deceasedName: result.deceasedName,
      title: result.title,
      funeralType: result.funeralType,
      isOrganizer: result.isOrganizer
    });

    return result;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    console.error('Error getting funeral room:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      roomId
    });
    throw error;
  }
};

// Update canvas items only
export const updateCanvasItems = async (roomId: string, canvasItems: CanvasItem[], password?: string): Promise<boolean> => {
  try {
    const url = password 
      ? `${API_URL}/room/${roomId}/canvas?password=${encodeURIComponent(password)}`
      : `${API_URL}/room/${roomId}/canvas`;
    
    console.log(`Updating canvas items for room: ${roomId}`);
    await axios.patch(url, { canvasItems }, axiosConfig);
    return true;
  } catch (error: any) {
    console.error('Error updating canvas items:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      roomId
    });
    return false;
  }
};

// Delete a funeral room
export const deleteFuneralRoom = async (roomId: string, password: string): Promise<boolean> => {
  try {
    console.log(`Deleting funeral room: ${roomId}`);
    
    // First verify the password
    const verifyResult = await verifyRoomPassword(roomId, password);
    if (!verifyResult.valid) {
      console.error('Invalid password for room deletion');
      return false;
    }
    
    // If password is valid, proceed with deletion
    await axios.delete(`${API_URL}/room/${roomId}?password=${encodeURIComponent(password)}`, axiosConfig);
    return true;
  } catch (error: any) {
    console.error('Error deleting funeral room:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      roomId
    });
    return false;
  }
};

// Edit a funeral room
export const editFuneralRoom = async (roomId: string, password: string, updates: Partial<FuneralRoom>): Promise<FuneralRoom | null> => {
  try {
    console.log(`Editing funeral room: ${roomId}`);
    
    // First verify the password
    const verifyResult = await verifyRoomPassword(roomId, password);
    if (!verifyResult.valid) {
      console.error('Invalid password for room editing');
      return null;
    }
    
    // If password is valid, proceed with update
    const response = await axios.patch(
      `${API_URL}/room/${roomId}?password=${encodeURIComponent(password)}`, 
      updates, 
      axiosConfig
    );
    
    // Convert response data to FuneralRoom interface
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
      backgroundImage: data.backgroundImage || '',
      deceasedImage: data.deceasedImage || '',
      canvasItems: data.canvasItems || [],
      createdAt: new Date(data.createdAt).getTime(),
      updatedAt: new Date(data.updatedAt).getTime(),
    };
  } catch (error: any) {
    console.error('Error editing funeral room:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      roomId
    });
    return null;
  }
};

// Verify a funeral room password
export const verifyRoomPassword = async (roomId: string, password: string): Promise<{valid: boolean, isOrganizer: boolean}> => {
  try {
    console.log(`Verifying password for room: ${roomId}`);
    const response = await axios.post(`${API_URL}/room/verify`, {
      roomId,
      password
    }, axiosConfig);
    
    // 记录后端返回的isOrganizer值
    console.log(`[verifyRoomPassword] Room ${roomId} isOrganizer:`, response.data.isOrganizer);
    
    return {
      valid: response.data.valid,
      isOrganizer: response.data.valid === true // 密码正确即为组织者
    };
  } catch (error: any) {
    console.error('Error verifying room password:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      roomId
    });
    return {valid: false, isOrganizer: false};
  }
};

// Generate mock funeral rooms for testing
export const getMockFuneralRooms = (): FuneralRoom[] => {
  return [
    {
      roomId: 'room1',
      password: 'password1',
      deceasedName: 'John Smith',
      funeralType: 'church',
      backgroundImage: '',
      deceasedImage: '',
      canvasItems: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      roomId: 'room2',
      password: 'password2',
      deceasedName: 'Mary Johnson',
      funeralType: 'garden',
      backgroundImage: '',
      deceasedImage: '',
      canvasItems: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      roomId: 'room3',
      password: 'password3',
      deceasedName: 'David Williams',
      funeralType: 'forest',
      backgroundImage: '',
      deceasedImage: '',
      canvasItems: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ];
}; 
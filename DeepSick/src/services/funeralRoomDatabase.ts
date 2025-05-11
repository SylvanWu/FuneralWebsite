// Database service for funeral rooms
// This service provides functions to save and load funeral room data

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

// Use localStorage as a simple database solution
const DB_KEY = 'funeral_rooms_db';

// Get all funeral rooms from database
export const getAllFuneralRooms = (): FuneralRoom[] => {
  try {
    const roomsData = localStorage.getItem(DB_KEY);
    return roomsData ? JSON.parse(roomsData) : [];
  } catch (error) {
    console.error('Error getting funeral rooms:', error);
    return [];
  }
};

// Create or update a funeral room
export const saveFuneralRoom = (room: FuneralRoom): FuneralRoom => {
  try {
    // Get existing rooms
    const rooms = getAllFuneralRooms();
    
    // Check if room already exists
    const existingRoomIndex = rooms.findIndex(r => r.roomId === room.roomId);
    
    // Update timestamps
    const now = Date.now();
    const updatedRoom = { 
      ...room, 
      updatedAt: now,
      createdAt: existingRoomIndex >= 0 ? rooms[existingRoomIndex].createdAt : now 
    };
    
    // Update or add room
    if (existingRoomIndex >= 0) {
      rooms[existingRoomIndex] = updatedRoom;
    } else {
      rooms.push(updatedRoom);
    }
    
    // Save to localStorage
    localStorage.setItem(DB_KEY, JSON.stringify(rooms));
    return updatedRoom;
  } catch (error) {
    console.error('Error saving funeral room:', error);
    throw new Error('Failed to save funeral room');
  }
};

// Get a funeral room by ID
export const getFuneralRoomById = (roomId: string): FuneralRoom | null => {
  try {
    const rooms = getAllFuneralRooms();
    const room = rooms.find(r => r.roomId === roomId);
    return room || null;
  } catch (error) {
    console.error('Error getting funeral room:', error);
    return null;
  }
};

// Delete a funeral room
export const deleteFuneralRoom = (roomId: string): boolean => {
  try {
    const rooms = getAllFuneralRooms();
    const filteredRooms = rooms.filter(r => r.roomId !== roomId);
    
    if (filteredRooms.length === rooms.length) {
      return false; // Room not found
    }
    
    localStorage.setItem(DB_KEY, JSON.stringify(filteredRooms));
    return true;
  } catch (error) {
    console.error('Error deleting funeral room:', error);
    return false;
  }
}; 
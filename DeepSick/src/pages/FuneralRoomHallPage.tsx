import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllFuneralRooms,
  FuneralRoom,
  verifyRoomPassword,
  getMockFuneralRooms,
  deleteFuneralRoom,
  editFuneralRoom
} from '../services/funeralRoomDatabase';
import './FuneralRoomHallPage.css';
import axios from 'axios';
import RoomList from '../components/rooms/RoomList';

// Import background images for room cards
import churchImage from '../assets/funeralType/churchFuneral.png';
import gardenImage from '../assets/funeralType/gardenFuneral.png';
import forestImage from '../assets/funeralType/forestFuneral.png';
import seasideImage from '../assets/funeralType/seasideFuneral.png';
import starryNightImage from '../assets/funeralType/starryNightFuneral.png';
import chineseTraditionalImage from '../assets/funeralType/chineseTraditionalFuneral.png';

// Background image mapping
const backgroundImageMap: Record<string, string> = {
  'church': churchImage,
  'garden': gardenImage,
  'forest': forestImage,
  'seaside': seasideImage,
  'starryNight': starryNightImage,
  'chineseTraditional': chineseTraditionalImage,
};

// Password modal component props
interface PasswordModalProps {
  show: boolean;
  roomId: string;
  onClose: () => void;
  onSubmit: (password: string) => void;
  error?: string;
}

// Password modal component
const PasswordModal: React.FC<PasswordModalProps> = ({
  show, roomId, onClose, onSubmit, error
}) => {
  const [password, setPassword] = useState('');

  // Reset password when modal is opened/closed
  useEffect(() => {
    if (show) {
      setPassword('');
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="password-modal-overlay">
      <div className="password-modal">
        <div className="password-modal-header">
          <h2>Enter Room Password</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="password-modal-body">
          <p>Please enter the password for room {roomId}</p>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password-input"
            autoFocus
          />
          {error && <p className="error-message">{error}</p>}
        </div>
        <div className="password-modal-footer">
          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="submit-btn"
            onClick={() => onSubmit(password)}
            disabled={!password}
          >
            Enter Room
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit room modal component
interface EditRoomModalProps {
  show: boolean;
  room: FuneralRoom | null;
  onClose: () => void;
  onSave: (updatedRoom: FuneralRoom) => void;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({
  show,
  room,
  onClose,
  onSave
}) => {
  const [deceasedName, setDeceasedName] = useState('');
  const [funeralType, setFuneralType] = useState('');
  const [password, setPassword] = useState('');

  // Initialize form data
  useEffect(() => {
    if (room && show) {
      setDeceasedName(room.deceasedName);
      setFuneralType(room.funeralType);
      setPassword(room.password);
    }
  }, [room, show]);

  if (!show || !room) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRoom = {
      ...room,
      deceasedName,
      funeralType,
      password
    };
    onSave(updatedRoom);
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <div className="edit-modal-header">
          <h2>Edit Memorial Room</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="edit-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Deceased Name</label>
              <input
                type="text"
                value={deceasedName}
                onChange={(e) => setDeceasedName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Memorial Type</label>
              <select
                value={funeralType}
                onChange={(e) => setFuneralType(e.target.value)}
                required
              >
                <option value="church">Church</option>
                <option value="garden">Garden</option>
                <option value="forest">Forest</option>
                <option value="seaside">Seaside</option>
                <option value="starryNight">Starry Night</option>
                <option value="chineseTraditional">Chinese Traditional</option>
              </select>
            </div>

            <div className="form-group">
              <label>Room Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Confirm delete modal component
interface ConfirmDeleteModalProps {
  show: boolean;
  roomName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  show,
  roomName,
  onClose,
  onConfirm
}) => {
  if (!show) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <div className="confirm-modal-header">
          <h2>Confirm Delete</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="confirm-modal-body">
          <p>Are you sure you want to delete the memorial room "{roomName}"?</p>
          <p className="warning">This action cannot be undone!</p>
        </div>
        <div className="confirm-modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="delete-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Main funeral room hall page
const FuneralRoomHallPage: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<FuneralRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // User role status
  const [isOrganizer, setIsOrganizer] = useState(false);

  // The state of the room access modal box
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<FuneralRoom | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Edit the state of the modal box
  const [showEditModal, setShowEditModal] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<FuneralRoom | null>(null);

  // Delete the status of the confirmation modal box
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<FuneralRoom | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  // Operation feedback status
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'success' | 'error';
    visible: boolean;
  }>({
    message: '',
    type: 'success',
    visible: false
  });

  // Check authentication and user role
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const roleStr = localStorage.getItem('role');

    if (!token || !userStr) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    // Check if user is organizer
    if (roleStr === 'organizer' || roleStr === 'admin') {
      setIsOrganizer(true);
    }
  }, [navigate]);

  // Check server status first
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Attempt to connect to the server without authentication
        await axios.get('http://localhost:5001/api/health', { timeout: 5000 });
        setServerStatus('online');
      } catch (error) {
        console.error('Server health check failed:', error);
        setServerStatus('offline');
        setDebugInfo(`Server connection error: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    checkServerStatus();
  }, []);

  // Fetch all funeral rooms on component mount and when server is online
  useEffect(() => {
    if (serverStatus !== 'online') return;

    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const rooms = await getAllFuneralRooms();
        console.log('Rooms data received:', rooms);

        setRooms(rooms);
        setError(null);
        setDebugInfo(null);
      } catch (err: any) {
        console.error('Failed to fetch funeral rooms:', err);
        setError('Failed to load funeral rooms. Please try again later.');
        setDebugInfo(`Error: ${err?.message || 'Unknown error'}. Status: ${err?.response?.status || 'N/A'}. Response: ${JSON.stringify(err?.response?.data || {})}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [serverStatus]);

  // Handle room card click (enter room)
  const handleRoomClick = (room: FuneralRoom) => {
    setSelectedRoom(room);
    setShowPasswordModal(true);
    setPasswordError(null);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setSelectedRoom(null);
    setPasswordError(null);
  };

  // Handle password submit for room entry
  const handlePasswordSubmit = async (password: string) => {
    if (!selectedRoom) return;

    try {
      const isValid = await verifyRoomPassword(selectedRoom.roomId, password);

      if (isValid) {
        // Close modal
        setShowPasswordModal(false);

        // Update to directly navigate to the route with the roomId parameter
        navigate(`/interactive/${selectedRoom.roomId}`, {
          state: {
            roomId: selectedRoom.roomId,
            password,
            funeralType: selectedRoom.funeralType,
            backgroundImage: selectedRoom.backgroundImage,
            name: selectedRoom.deceasedName,
            deceasedImage: selectedRoom.deceasedImage
          }
        });
      } else {
        setPasswordError('The password is incorrect. Please try again.');
      }
    } catch (err) {
      console.error('Failed to verify password:', err);
      setPasswordError('An error occurred. Please try again.');
    }
  };

  // Handle room edit
  const handleRoomEdit = async (room: FuneralRoom, password: string) => {
    try {
      // Verify password
      const isValid = await verifyRoomPassword(room.roomId, password);

      if (isValid) {
        // Open edit modal
        setRoomToEdit(room);
        setShowEditModal(true);
      } else {
        // Show error feedback
        showFeedback('Invalid password, cannot edit room', 'error');
      }
    } catch (err) {
      console.error('Failed to verify password for editing:', err);
      showFeedback('Error verifying password', 'error');
    }
  };

  // Save edited room
  const handleSaveEdit = async (updatedRoom: FuneralRoom) => {
    try {
      // Call API to update room
      const result = await editFuneralRoom(
        updatedRoom.roomId,
        updatedRoom.password,
        {
          deceasedName: updatedRoom.deceasedName,
          funeralType: updatedRoom.funeralType,
          password: updatedRoom.password
        }
      );

      if (result) {
        // Update local data
        setRooms(prevRooms =>
          prevRooms.map(room =>
            room.roomId === updatedRoom.roomId ? updatedRoom : room
          )
        );

        // Close modal
        setShowEditModal(false);
        setRoomToEdit(null);

        // Show success feedback
        showFeedback('Room updated successfully', 'success');
      } else {
        showFeedback('Failed to update room', 'error');
      }
    } catch (err) {
      console.error('Failed to update room:', err);
      showFeedback('Error updating room', 'error');
    }
  };

  // Handle room deletion
  const handleRoomDelete = async (room: FuneralRoom, password: string) => {
    try {
      // Verify password
      const isValid = await verifyRoomPassword(room.roomId, password);

      if (isValid) {
        // Store password and room, show confirmation modal
        setRoomToDelete(room);
        setDeletePassword(password);
        setShowDeleteConfirm(true);
      } else {
        // Show error feedback
        showFeedback('Invalid password, cannot delete room', 'error');
      }
    } catch (err) {
      console.error('Failed to verify password for deletion:', err);
      showFeedback('Error verifying password', 'error');
    }
  };

  // Confirm room deletion
  const handleConfirmDelete = async () => {
    if (!roomToDelete || !deletePassword) return;

    try {
      // Call API to delete room
      const success = await deleteFuneralRoom(roomToDelete.roomId, deletePassword);

      if (success) {
        // Remove room from local data
        setRooms(prevRooms =>
          prevRooms.filter(room => room.roomId !== roomToDelete.roomId)
        );

        // Close modal
        setShowDeleteConfirm(false);
        setRoomToDelete(null);
        setDeletePassword('');

        // Show success feedback
        showFeedback('Room successfully deleted', 'success');
      } else {
        showFeedback('Failed to delete room', 'error');
      }
    } catch (err) {
      console.error('Failed to delete room:', err);
      showFeedback('Error deleting room', 'error');
    }
  };

  // Show operation feedback
  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({
      message,
      type,
      visible: true
    });

    // 3 seconds auto hide
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Force reload data
  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      // Check server status again
      try {
        await axios.get('http://localhost:5001/api/health', { timeout: 5000 });
        setServerStatus('online');
      } catch (error) {
        setServerStatus('offline');
        throw new Error(`Server is offline: ${error instanceof Error ? error.message : String(error)}`);
      }

      // If server is online, fetch rooms
      const rooms = await getAllFuneralRooms();
      setRooms(rooms);
    } catch (err: any) {
      console.error('Failed to fetch funeral rooms on retry:', err);
      setError(`Failed to load funeral rooms: ${err?.message || 'Unknown error'}`);
      setDebugInfo(`Error: ${err?.message || 'Unknown error'}. Status: ${err?.response?.status || 'N/A'}. Response: ${JSON.stringify(err?.response?.data || {})}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data creation for testing UI without backend
  const createMockData = () => {
    // Use the mock data from the service
    const mockRooms = getMockFuneralRooms();

    setRooms(mockRooms);
    setIsLoading(false);
    setError(null);
    setServerStatus('online'); // Pretend we're connected
    setDebugInfo('Using mock data for testing. For testing purposes, use password: "password1" for room1, "password2" for room2, etc.');
  };

  return (
    <div className="funeral-hall-container">
      <div className="funeral-hall-header">
        <h1>Memorial Hall</h1>
        <p>Click on a room to enter and pay respects</p>
      </div>

      {/* Feedback message */}
      {feedback.visible && (
        <div className={`feedback-message ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {serverStatus === 'checking' ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Checking server status...</p>
        </div>
      ) : serverStatus === 'offline' ? (
        <div className="error-container">
          <p className="error-message">Server appears to be offline or unreachable.</p>
          <div className="debug-info">
            <p>Debug information:</p>
            <pre>{debugInfo}</pre>
          </div>
          <div className="mock-button-container">
            <p>You can continue testing with mock data:</p>
            <button
              onClick={createMockData}
              className="mock-button large"
            >
              Load Mock Data
            </button>
          </div>
          <div className="button-group">
            <button
              onClick={handleRetry}
              className="retry-button"
            >
              Retry Connection
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading memorial rooms...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          {debugInfo && (
            <div className="debug-info">
              <p>Debug information:</p>
              <pre>{debugInfo}</pre>
            </div>
          )}
          <div className="mock-button-container">
            <p>You can continue testing with mock data:</p>
            <button
              onClick={createMockData}
              className="mock-button large"
            >
              Load Mock Data
            </button>
          </div>
          <div className="button-group">
            <button
              onClick={handleRetry}
              className="retry-button"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <RoomList
          rooms={rooms}
          onRoomSelect={handleRoomClick}
          isOrganizer={isOrganizer}
          onRoomEdit={isOrganizer ? handleRoomEdit : undefined}
          onRoomDelete={isOrganizer ? handleRoomDelete : undefined}
        />
      )}

      {debugInfo && rooms.length > 0 && (
        <div className="debug-info-footer">
          <pre>{debugInfo}</pre>
        </div>
      )}

      {/* Room entry password modal */}
      <PasswordModal
        show={showPasswordModal}
        roomId={selectedRoom?.roomId || ''}
        onClose={handleCloseModal}
        onSubmit={handlePasswordSubmit}
        error={passwordError || undefined}
      />

      {/* Edit room modal */}
      <EditRoomModal
        show={showEditModal}
        room={roomToEdit}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
      />

      {/* Confirm delete modal */}
      <ConfirmDeleteModal
        show={showDeleteConfirm}
        roomName={roomToDelete?.deceasedName || ''}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default FuneralRoomHallPage; 
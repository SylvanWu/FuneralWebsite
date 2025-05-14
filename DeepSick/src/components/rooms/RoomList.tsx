import React, { useState, useEffect } from 'react';
import { FuneralRoom } from '../../services/funeralRoomDatabase';
import './RoomList.css';
import { useNavigate } from 'react-router-dom';

// Background image mapping
import churchImage from '../../assets/funeralType/church funeral.png';
import gardenImage from '../../assets/funeralType/garden funeral.png';
import forestImage from '../../assets/funeralType/forest funeral.png';
import seasideImage from '../../assets/funeralType/seaside funeral.png';
import starryNightImage from '../../assets/funeralType/Starry Night Funeral.png';
import chineseTraditionalImage from '../../assets/funeralType/Chinese traditional funeral.png';

const backgroundImageMap: Record<string, string> = {
  'church': churchImage,
  'garden': gardenImage,
  'forest': forestImage,
  'seaside': seasideImage,
  'starryNight': starryNightImage,
  'chineseTraditional': chineseTraditionalImage,
};

// Room card component props
interface RoomCardProps {
  room: FuneralRoom;
  onClick: (room: FuneralRoom) => void;
  isSelected?: boolean;
  isOrganizer?: boolean;
  onEdit?: (room: FuneralRoom) => void;
  onDelete?: (room: FuneralRoom) => void;
}

// Room card component
const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onClick,
  isSelected,
  isOrganizer = false,
  onEdit,
  onDelete
}) => {
  // Get the appropriate background image
  const backgroundImage = room.deceasedImage || backgroundImageMap[room.funeralType] || churchImage;

  // Handle edit button click
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    if (onEdit) onEdit(room);
  };

  // Handle delete button click
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    if (onDelete) onDelete(room);
  };

  return (
    <div
      className={`room-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(room)}
    >
      <div className="room-card-image">
        <img src={backgroundImage} alt={room.deceasedName} />

        {/* Management controls for organizers */}
        {isOrganizer && (
          <div className="room-card-controls">
            <button
              className="room-card-edit-btn"
              onClick={handleEdit}
              title="Edit Room"
            >
              <i className="fas fa-edit"></i>
              Edit
            </button>
            <button
              className="room-card-delete-btn"
              onClick={handleDelete}
              title="Delete Room"
            >
              <i className="fas fa-trash-alt"></i>
              Delete
            </button>
          </div>
        )}
      </div>
      <div className="room-card-info">
        <h3 className="room-card-name">{room.deceasedName}</h3>
        <p className="room-card-id">Room ID: {room.roomId}</p>
      </div>
    </div>
  );
};

// Password modal component props
interface PasswordModalProps {
  show: boolean;
  roomId: string;
  title: string;
  message: string;
  onClose: () => void;
  onSubmit: (password: string) => void;
  error?: string;
}

// Password modal component
const PasswordModal: React.FC<PasswordModalProps> = ({
  show,
  roomId,
  title,
  message,
  onClose,
  onSubmit,
  error
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
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="password-modal-body">
          <p>{message} {roomId}</p>
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
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Props for SearchBox component
interface SearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

// SearchBox component
const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, placeholder = "Search by room ID or name..." }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="search-box-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
    </div>
  );
};

// Interface for RoomList component props
interface RoomListProps {
  rooms: FuneralRoom[];
  onRoomSelect: (room: FuneralRoom) => void;
  currentRoomId?: string;
  className?: string;
  isOrganizer?: boolean;
  onRoomEdit?: (room: FuneralRoom, password: string) => void;
  onRoomDelete?: (room: FuneralRoom, password: string) => void;
}

// RoomList component
const RoomList: React.FC<RoomListProps> = ({
  rooms,
  onRoomSelect,
  currentRoomId,
  className = '',
  isOrganizer = false,
  onRoomEdit,
  onRoomDelete
}) => {
  // State for filtered rooms
  const [filteredRooms, setFilteredRooms] = useState<FuneralRoom[]>(rooms);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'delete'>('edit');
  const [selectedRoom, setSelectedRoom] = useState<FuneralRoom | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Update filtered rooms when rooms prop changes
  useEffect(() => {
    setFilteredRooms(rooms);
  }, [rooms]);

  // Handle search
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredRooms(rooms);
      setSearchPerformed(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = rooms.filter(room =>
      room.roomId.toLowerCase().includes(lowerQuery) ||
      room.deceasedName.toLowerCase().includes(lowerQuery)
    );

    setFilteredRooms(filtered);
    setSearchPerformed(true);
  };

  // Reset search
  const resetSearch = () => {
    setFilteredRooms(rooms);
    setSearchPerformed(false);
  };

  // Handle edit button click
  const handleEdit = (room: FuneralRoom) => {
    setSelectedRoom(room);
    setModalMode('edit');
    setShowPasswordModal(true);
    setPasswordError(null);
  };

  // Handle delete button click
  const handleDelete = (room: FuneralRoom) => {
    setSelectedRoom(room);
    setModalMode('delete');
    setShowPasswordModal(true);
    setPasswordError(null);
  };

  // Handle password modal close
  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setSelectedRoom(null);
    setPasswordError(null);
  };

  // Handle password submit
  const handlePasswordSubmit = (password: string) => {
    if (!selectedRoom) return;

    if (modalMode === 'edit' && onRoomEdit) {
      onRoomEdit(selectedRoom, password);
      setShowPasswordModal(false);
    } else if (modalMode === 'delete' && onRoomDelete) {
      onRoomDelete(selectedRoom, password);
      setShowPasswordModal(false);
    }
  };

  return (
    <div className={`room-list-container ${className}`}>

      {/* Search box */}
      <SearchBox onSearch={handleSearch} placeholder="Search by room ID or name..." />

      {/* Room list */}
      {filteredRooms.length > 0 ? (
        <div className="room-grid">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.roomId}
              room={room}
              onClick={onRoomSelect}
              isSelected={room.roomId === currentRoomId}
              isOrganizer={isOrganizer}
              onEdit={onRoomEdit ? handleEdit : undefined}
              onDelete={onRoomDelete ? handleDelete : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>No rooms found matching your search criteria.</p>
          <button className="reset-button" onClick={resetSearch}>
            Show All Rooms
          </button>
        </div>
      )}

      {/* Password modal for edit/delete operations */}
      <PasswordModal
        show={showPasswordModal}
        roomId={selectedRoom?.roomId || ''}
        title={modalMode === 'edit' ? 'Edit Room' : 'Delete Room'}
        message={modalMode === 'edit' ? 'Please enter the room password to edit:' : 'Please enter the room password to delete:'}
        onClose={handleCloseModal}
        onSubmit={handlePasswordSubmit}
        error={passwordError || undefined}
      />
    </div>
  );
};

export default RoomList; 
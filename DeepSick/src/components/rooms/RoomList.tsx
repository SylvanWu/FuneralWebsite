import React, { useState, useEffect } from 'react';
import { FuneralRoom } from '../../services/funeralRoomDatabase';
import './RoomList.css';

// Background image mapping
import churchImage from '../../assets/funeral type/church funeral.png';
import gardenImage from '../../assets/funeral type/garden funeral.png';
import forestImage from '../../assets/funeral type/forest funeral.png';
import seasideImage from '../../assets/funeral type/seaside funeral.png';
import starryNightImage from '../../assets/funeral type/Starry Night Funeral.png';
import chineseTraditionalImage from '../../assets/funeral type/Chinese traditional funeral.png';

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
}

// Room card component
const RoomCard: React.FC<RoomCardProps> = ({ room, onClick, isSelected }) => {
  // Get the appropriate background image
  const backgroundImage = room.deceasedImage || backgroundImageMap[room.funeralType] || churchImage;
  
  return (
    <div 
      className={`room-card ${isSelected ? 'selected' : ''}`} 
      onClick={() => onClick(room)}
    >
      <div className="room-card-image">
        <img src={backgroundImage} alt={room.deceasedName} />
      </div>
      <div className="room-card-info">
        <h3 className="room-card-name">{room.deceasedName}</h3>
        <p className="room-card-id">Room ID: {room.roomId}</p>
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
}

// RoomList component
const RoomList: React.FC<RoomListProps> = ({ 
  rooms, 
  onRoomSelect, 
  currentRoomId,
  className = ''
}) => {
  // State for filtered rooms
  const [filteredRooms, setFilteredRooms] = useState<FuneralRoom[]>(rooms);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
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
  
  return (
    <div className={`room-list-container ${className}`}>
      <h2 className="room-list-title">Available Memorial Rooms</h2>
      
      {/* Search box */}
      <SearchBox onSearch={handleSearch} />
      
      {/* Room list */}
      {filteredRooms.length > 0 ? (
        <div className="room-grid">
          {filteredRooms.map((room) => (
            <RoomCard 
              key={room.roomId} 
              room={room} 
              onClick={onRoomSelect}
              isSelected={room.roomId === currentRoomId}
            />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>No rooms found matching your search criteria.</p>
          <button className="reset-button" onClick={resetSearch}>
            Show all rooms
          </button>
        </div>
      )}
    </div>
  );
};

export default RoomList; 
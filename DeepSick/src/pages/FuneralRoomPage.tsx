import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Rect, Text } from 'react-konva';
import { saveFuneralRoom, getFuneralRoomById, FuneralRoom } from '../services/funeralRoomDatabase';
import DeceasedImage from '../components/DeceasedImage';

// Placeholder vector icons - replace with actual SVGs
const placeholderIcons = [
  { id: 'icon1', color: '#FFD700', name: 'Gold Candle' },
  { id: 'icon2', color: '#FF6347', name: 'Red Flower' },
  { id: 'icon3', color: '#4682B4', name: 'Blue Urn' },
  { id: 'icon4', color: '#32CD32', name: 'Green Wreath' },
  { id: 'icon5', color: '#9370DB', name: 'Purple Incense' },
];

// Interface for draggable items on the canvas
interface CanvasItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  name: string;
}

const FuneralRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Retrieve funeral type and background image from router state or database
  const locationState = location.state as {
    funeralType: string;
    backgroundImage: string;
    password: string;
    name: string;
  } | null;

  // State to hold funeral room data
  const [state, setState] = useState<{
    funeralType: string;
    backgroundImage: string;
    password: string;
    name: string;
    deceasedImage?: string;
  }>({
    funeralType: 'default',
    backgroundImage: '',
    password: '',
    name: '',
  });
  
  // Canvas state
  const stageRef = useRef<any>(null);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Load funeral room data from database on mount
  useEffect(() => {
    if (!roomId) return;
    
    // Check if we have data in location state
    if (locationState) {
      setState(locationState);
      setIsLoading(false);
      return;
    }
    
    // Otherwise, try to load from database
    const funeralRoom = getFuneralRoomById(roomId);
    if (funeralRoom) {
      setState({
        funeralType: funeralRoom.funeralType,
        backgroundImage: funeralRoom.backgroundImage,
        password: funeralRoom.password,
        name: funeralRoom.deceasedName,
        deceasedImage: funeralRoom.deceasedImage,
      });
      
      if (funeralRoom.canvasItems) {
        setCanvasItems(funeralRoom.canvasItems);
      }
    } else if (!locationState) {
      // If no data found in location state or database, show error or redirect
      navigate('/create-funeral', { replace: true });
    }
    
    setIsLoading(false);
  }, [roomId, locationState, navigate]);
  
  // Function to add a new item to the canvas
  const handleAddItem = (item: { id: string; color: string; name: string }) => {
    const newItem: CanvasItem = {
      id: `${item.id}-${Date.now()}`,
      x: Math.random() * 300 + 100,
      y: Math.random() * 300 + 100,
      width: 50,
      height: 50,
      color: item.color,
      name: item.name,
    };
    
    setCanvasItems([...canvasItems, newItem]);
  };
  
  // Function to save the funeral room data to the database
  const handleSave = () => {
    if (!roomId) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Create funeral room object
      const funeralRoom: FuneralRoom = {
        roomId,
        password: state.password,
        deceasedName: state.name,
        funeralType: state.funeralType,
        backgroundImage: state.backgroundImage,
        deceasedImage: state.deceasedImage,
        canvasItems: canvasItems, // Save all canvas items
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      // Save to database
      saveFuneralRoom(funeralRoom);
      
      // Show success message
      setSaveMessage('Funeral room saved successfully!');
      
      // Hide message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving funeral room:', error);
      setSaveMessage('Error saving funeral room');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    // Set background image dynamically based on funeral type
    <div className="min-h-screen" style={{ 
      backgroundImage: `url(${state.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white bg-opacity-80 rounded-lg p-6 mb-8">
          {/* Display deceased person's image */}
          <DeceasedImage 
            imageUrl={state.deceasedImage} 
            name={state.name} 
          />
          
          <h1 className="text-3xl font-bold mb-2 text-center">Funeral Room: {roomId}</h1>
          <p className="text-gray-700 text-center mb-4">
            Type: {state.funeralType} | Password: {state.password}
          </p>
          
          {/* Save Button */}
          <div className="mt-4 text-center">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Room'}
            </button>
            
            {saveMessage && (
              <div className="mt-2 text-green-600">{saveMessage}</div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar / Toolbox */}
          <div className="w-full md:w-64 bg-white bg-opacity-90 rounded-lg p-4 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Decorations</h2>
            <div className="space-y-3">
              {placeholderIcons.map((icon) => (
                <div 
                  key={icon.id}
                  className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => handleAddItem(icon)}
                >
                  <div
                    className="w-10 h-10 rounded-md mr-3"
                    style={{ backgroundColor: icon.color }}
                  ></div>
                  <span>{icon.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Canvas Area */}
          <div className="flex-1 bg-white bg-opacity-70 rounded-lg shadow-lg overflow-hidden">
            <Stage
              ref={stageRef}
              width={800}
              height={600}
              className="mx-auto"
            >
              <Layer>
                {canvasItems.map((item) => (
                  <React.Fragment key={item.id}>
                    {/* Using rectangles as placeholders; replace with actual SVGs/images later */}
                    <Rect
                      x={item.x}
                      y={item.y}
                      width={item.width}
                      height={item.height}
                      fill={item.color}
                      cornerRadius={5}
                      draggable
                      onDragEnd={(e) => {
                        const updatedItems = canvasItems.map((i) => {
                          if (i.id === item.id) {
                            return {
                              ...i,
                              x: e.target.x(),
                              y: e.target.y(),
                            };
                          }
                          return i;
                        });
                        setCanvasItems(updatedItems);
                      }}
                      onClick={() => setSelectedItemId(item.id)}
                      onTap={() => setSelectedItemId(item.id)}
                    />
                  </React.Fragment>
                ))}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuneralRoomPage; 
import React, { useState, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Stage, Layer, Rect, Text } from 'react-konva';

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
  const state = location.state as {
    funeralType: string;
    backgroundImage: string;
    password: string;
  } || {
    funeralType: 'default',
    backgroundImage: '',
    password: ''
  };

  // Canvas state
  const stageRef = useRef<any>(null);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
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

  return (
    <div className="min-h-screen" style={{ 
      backgroundImage: `url(${state.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white bg-opacity-80 rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">Funeral Room: {roomId}</h1>
          <p className="text-gray-700">
            Type: {state.funeralType} | Password: {state.password}
          </p>
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
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva';
import { saveFuneralRoom, getFuneralRoomById, FuneralRoom } from '../services/funeralRoomDatabase';
import DeceasedImage from '../components/DeceasedImage';

// Import background images for direct reference
import churchImage from '../assets/funeral type/church funeral.png';
import gardenImage from '../assets/funeral type/garden funeral.png';
import forestImage from '../assets/funeral type/forest funeral.png';
import seasideImage from '../assets/funeral type/seaside funeral.png';
import starryNightImage from '../assets/funeral type/Starry Night Funeral.png';
import chineseTraditionalImage from '../assets/funeral type/Chinese traditional funeral.png';

// Background image mapping for fallback or replacement
const backgroundImageMap = {
  'church': churchImage,
  'garden': gardenImage,
  'forest': forestImage,
  'seaside': seasideImage,
  'starryNight': starryNightImage,
  'chineseTraditional': chineseTraditionalImage,
};

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
  
  // 添加背景图片状态
  const [backgroundImg, setBackgroundImg] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  // Load funeral room data from database on mount
  useEffect(() => {
    if (!roomId) return;
    
    // Preload all background images
    Object.values(backgroundImageMap).forEach(src => {
      const img = new Image();
      img.src = src;
    });
    
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
  
  // Load background image on mount
  useEffect(() => {
    const bgImage = new Image();
    bgImage.src = getBackgroundImage();
    bgImage.onload = () => {
      setBackgroundImg(bgImage);
      
      // 根据窗口大小调整画布尺寸
      const maxWidth = Math.min(window.innerWidth - 100, 1200);
      const maxHeight = Math.min(window.innerHeight - 200, 800);
      
      // 保持图片比例
      const imgRatio = bgImage.width / bgImage.height;
      let canvasWidth = maxWidth;
      let canvasHeight = canvasWidth / imgRatio;
      
      if (canvasHeight > maxHeight) {
        canvasHeight = maxHeight;
        canvasWidth = canvasHeight * imgRatio;
      }
      
      setCanvasSize({
        width: canvasWidth,
        height: canvasHeight
      });
    };
    bgImage.onerror = () => {
      console.error('Failed to load background image');
    };
  }, [state.funeralType]);
  
  // Function to get background image, with fallback to mapping if needed
  const getBackgroundImage = () => {
    // Debug: print the background image path
    console.log('Background Image from state:', state.backgroundImage);
    console.log('Funeral Type:', state.funeralType);
    
    // 直接使用映射中的背景图片，确保我们使用的是已导入的图片对象
    if (state.funeralType && state.funeralType in backgroundImageMap) {
      const type = state.funeralType as keyof typeof backgroundImageMap;
      console.log('Using mapped image for type:', type);
      return backgroundImageMap[type];
    }
    
    // 如果没有找到对应类型，返回默认图片或空字符串
    console.log('No matching type found, using default or empty');
    return churchImage; // 默认使用教堂背景
  };
  
  // Function to add a new item to the canvas
  const handleAddItem = (item: { id: string; color: string; name: string }) => {
    // 调整新项目的位置，使其在画布中间位置
    const newItem: CanvasItem = {
      id: `${item.id}-${Date.now()}`,
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
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

  // Add debugging code before "return"
  useEffect(() => {
    console.log('Current state:', state);
    console.log('Available background images:', backgroundImageMap);
    
    // Confirm whether all the pictures have been imported correctly
    Object.entries(backgroundImageMap).forEach(([type, imgSrc]) => {
      console.log(`Image for ${type}:`, imgSrc);
    });
  }, [state.backgroundImage, state.funeralType]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
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
          <div className="flex-1 bg-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="text-center text-gray-500 py-2">
              <p>Click on the decorations to add them to the scene, and you can drag and place them</p>
            </div>
            <Stage
              ref={stageRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="mx-auto"
            >
              <Layer>
                {/* background image */}
                {backgroundImg && (
                  <KonvaImage
                    image={backgroundImg}
                    width={canvasSize.width}
                    height={canvasSize.height}
                  />
                )}
                
                {/* decorations */}
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
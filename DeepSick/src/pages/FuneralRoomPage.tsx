import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva';
import { saveFuneralRoom, getFuneralRoomById, FuneralRoom } from '../services/funeralRoomDatabase';
import DeceasedImage from '../components/DeceasedImage';
import Cropper from 'react-easy-crop';

// Import background images for direct reference
import churchImage from '../assets/funeral type/church funeral.png';
import gardenImage from '../assets/funeral type/garden funeral.png';
import forestImage from '../assets/funeral type/forest funeral.png';
import seasideImage from '../assets/funeral type/seaside funeral.png';
import starryNightImage from '../assets/funeral type/Starry Night Funeral.png';
import chineseTraditionalImage from '../assets/funeral type/Chinese traditional funeral.png';

// Import decoration images
import chocolateImage from '../assets/small picture/chocolate.png';
import milkImage from '../assets/small picture/milk.png';
import strawberryMilkImage from '../assets/small picture/streberry milk.png';
import blueFlowerImage from '../assets/small picture/blue flower.png';
import redTreeImage from '../assets/small picture/red tree.png';
import bianfuImage from '../assets/small picture/bianfu.png';

// Background image mapping for fallback or replacement
const backgroundImageMap = {
  'church': churchImage,
  'garden': gardenImage,
  'forest': forestImage,
  'seaside': seasideImage,
  'starryNight': starryNightImage,
  'chineseTraditional': chineseTraditionalImage,
};

// Decoration items with images
const decorationItems = [
  { id: 'chocolate', color: '#8B4513', name: 'Memorial Chocolate', image: chocolateImage, description: 'Chocolate offering for the deceased' },
  { id: 'milk', color: '#FFFFFF', name: 'Milk Offering', image: milkImage, description: 'Pure milk to symbolize purity and nourishment' },
  { id: 'strawberryMilk', color: '#FFB6C1', name: 'Strawberry Milk', image: strawberryMilkImage, description: 'Sweet strawberry milk for comfort' },
  { id: 'blueFlower', color: '#4169E1', name: 'Blue Flower', image: blueFlowerImage, description: 'Elegant blue flowers to express remembrance' },
  { id: 'redTree', color: '#B22222', name: 'Memorial Tree', image: redTreeImage, description: 'A symbolic tree for growth and lasting memory' },
  { id: 'bianfu', color: '#2F4F4F', name: 'Spiritual Symbol', image: bianfuImage, description: 'A spiritual symbol for protection and guidance' },
];

// Maximum file size for deceased image (500MB in bytes)
const MAX_FILE_SIZE = 500 * 1024 * 1024;

// Size constants for cropped image
const CROP_IMAGE_SIZE = 128; // 128x128px final size

// Size constant for decoration items
const DECORATION_ITEM_SIZE = 10; // 10x10px

// Function to create an image from a file
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

// Function to get cropped canvas from image and crop area
const getCroppedImg = async (imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<string> => {
  try {
    console.log('Loading image for cropping...');
    const image = await createImage(imageSrc);
    console.log('Image loaded, dimensions:', image.width, 'x', image.height);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Set the canvas size to the final desired size (128x128)
    canvas.width = CROP_IMAGE_SIZE;
    canvas.height = CROP_IMAGE_SIZE;
    
    console.log('Drawing cropped section on canvas...');
    // Draw the cropped image with scaling
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      CROP_IMAGE_SIZE,
      CROP_IMAGE_SIZE
    );
    
    // Return as data URL (base64 string)
    console.log('Converting canvas to data URL...');
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95); // higher quality
    console.log('Data URL generated, length:', dataUrl.length);
    return dataUrl;
  } catch (error) {
    console.error('Error in getCroppedImg function:', error);
    throw error;
  }
};

// Interface for draggable items on the canvas
interface CanvasItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  name: string;
  image?: string; // Path to the image
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
  
  // Deceased photo upload state
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Image cropping states
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  
  // 添加背景图片状态
  const [backgroundImg, setBackgroundImg] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  // State to store loaded decoration images
  const [decorationImages, setDecorationImages] = useState<{[key: string]: HTMLImageElement}>({});
  
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
  
  // Load images when component mounts
  useEffect(() => {
    // Preload all decoration images
    decorationItems.forEach(item => {
      if (item.image) {
        const img = new Image();
        img.src = item.image;
        img.onload = () => {
          setDecorationImages(prev => ({
            ...prev,
            [item.id]: img
          }));
        };
      }
    });
  }, []);
  
  // Load or update item images when canvasItems changes
  useEffect(() => {
    canvasItems.forEach(item => {
      if (item.image && !decorationImages[item.id.split('-')[0]]) {
        const img = new Image();
        img.src = item.image;
        img.onload = () => {
          setDecorationImages(prev => ({
            ...prev,
            [item.id.split('-')[0]]: img
          }));
        };
      }
    });
  }, [canvasItems, decorationImages]);
  
  // Handle deceased image upload
  const handleDeceasedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Reset any previous error
    setUploadError(null);
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 500MB)
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File size exceeds the limit of 500MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
      return;
    }
    
    // Create a FileReader to read the image file
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        // Instead of saving directly, set the image for cropping
        setImageToCrop(event.target.result as string);
        setIsCropping(true);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Handle crop complete event
  const onCropComplete = (
    _croppedArea: { x: number; y: number; width: number; height: number },
    croppedAreaPixels: { x: number; y: number; width: number; height: number }
  ) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };
  
  // Handle save cropped image
  const handleSaveCroppedImage = useCallback(async () => {
    if (!imageToCrop || !croppedAreaPixels) {
      console.error('Missing image or crop area data');
      return;
    }
    
    try {
      console.log('Cropping image with parameters:', croppedAreaPixels);
      
      // Get the cropped image
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      console.log('Image cropped successfully');
      
      // Update component state with the cropped image
      setState(prevState => ({
        ...prevState,
        deceasedImage: croppedImage,
      }));
      
      // Save to database
      if (roomId) {
        console.log('Saving to database...');
        const updatedRoom: FuneralRoom = {
          roomId,
          password: state.password,
          deceasedName: state.name,
          funeralType: state.funeralType,
          backgroundImage: state.backgroundImage,
          deceasedImage: croppedImage,
          canvasItems: canvasItems,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        saveFuneralRoom(updatedRoom);
        setSaveMessage('Deceased image saved successfully!');
        
        // Hide message after 3 seconds
        setTimeout(() => {
          setSaveMessage('');
        }, 3000);
      }
      
      // Reset cropping state
      setIsCropping(false);
      setImageToCrop(null);
      console.log('Crop process completed');
    } catch (error) {
      console.error('Error cropping image:', error);
      setUploadError('Failed to crop image. Please try again.');
    }
  }, [imageToCrop, croppedAreaPixels, roomId, state, canvasItems, setIsCropping, setImageToCrop, setSaveMessage, setUploadError]);
  
  // Cancel cropping
  const handleCancelCrop = useCallback(() => {
    setIsCropping(false);
    setImageToCrop(null);
  }, [setIsCropping, setImageToCrop]);
  
  // Function to remove deceased image
  const handleRemoveDeceasedImage = () => {
    // Update state
    setState({
      ...state,
      deceasedImage: undefined,
    });
    
    // Save to database
    if (roomId) {
      const updatedRoom: FuneralRoom = {
        roomId,
        password: state.password,
        deceasedName: state.name,
        funeralType: state.funeralType,
        backgroundImage: state.backgroundImage,
        deceasedImage: undefined,
        canvasItems: canvasItems,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      saveFuneralRoom(updatedRoom);
      setSaveMessage('Deceased image removed');
      
      // Hide message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    }
  };

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
  const handleAddItem = (item: { id: string; color: string; name: string; image?: string; description?: string }) => {
    // 调整新项目的位置，使其在画布中间位置
    const newItem: CanvasItem = {
      id: `${item.id}-${Date.now()}`,
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
      width: DECORATION_ITEM_SIZE,
      height: DECORATION_ITEM_SIZE,
      color: item.color,
      name: item.name,
      image: item.image,
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
  
  // Add keyboard event handling for Enter key to save cropped image and Escape to cancel
  useEffect(() => {
    if (!isCropping || !imageToCrop) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSaveCroppedImage();
      } else if (e.key === 'Escape') {
        handleCancelCrop();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isCropping, imageToCrop, croppedAreaPixels, handleSaveCroppedImage, handleCancelCrop]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Image Cropping Modal
  if (isCropping && imageToCrop) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Crop Image</h2>
          <p className="text-sm text-gray-600 mb-4">
            Adjust and crop the image to show the most important part. The image will be displayed as a square.
            <span className="font-semibold block mt-1">Press Enter to save after cropping or Escape to cancel.</span>
          </p>
          
          <div className="relative h-96 mb-4 bg-gray-100 rounded-lg overflow-hidden">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1} // 1:1 ratio for square crop
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="zoom-slider" className="block text-sm font-medium text-gray-700 mb-1">Zoom</label>
            <input
              id="zoom-slider"
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancelCrop}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              title="You can also press Escape to cancel"
            >
              Cancel (ESC)
            </button>
            <button
              onClick={handleSaveCroppedImage}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              title="You can also press Enter to save"
            >
              Save Image (Enter)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white bg-opacity-80 rounded-lg p-6 mb-8">
          {/* Display deceased person's info and image upload section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Deceased Person</h2>
            <div className="flex flex-col md:flex-row items-center mb-4">
              {/* Left side: Display the deceased image or placeholder */}
              <div className="mb-4 md:mb-0 md:mr-8">
                {state.deceasedImage ? (
                  <div className="relative">
                    <img 
                      src={state.deceasedImage} 
                      alt={state.name}
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                      style={{ 
                        width: `${CROP_IMAGE_SIZE}px`, 
                        height: `${CROP_IMAGE_SIZE}px`,
                        objectFit: 'cover'
                      }}
                    />
                    <button
                      onClick={handleRemoveDeceasedImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div 
                    className="bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center text-gray-400"
                    style={{ 
                      width: `${CROP_IMAGE_SIZE}px`, 
                      height: `${CROP_IMAGE_SIZE}px` 
                    }}
                  >
                    No image
                  </div>
                )}
              </div>
              
              {/* Right side: Upload controls */}
              <div className="flex-1">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold">{state.name}</h3>
                </div>
                
                {/* Upload image section */}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDeceasedImageUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    {state.deceasedImage ? 'Change Image' : 'Upload Image'}
                  </button>
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum size: 500MB
                  </p>
                  
                  {/* Error message for file size */}
                  {uploadError && (
                    <p className="text-red-500 text-sm mt-1">{uploadError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
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
              {decorationItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => handleAddItem(item)}
                >
                  <div 
                    className="mr-3 flex items-center justify-center"
                    style={{ 
                      width: `${DECORATION_ITEM_SIZE}px`, 
                      height: `${DECORATION_ITEM_SIZE}px`,
                      minWidth: `${DECORATION_ITEM_SIZE}px` // Prevent shrinking
                    }}
                  >
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="object-contain"
                        style={{ 
                          width: `${DECORATION_ITEM_SIZE}px`, 
                          height: `${DECORATION_ITEM_SIZE}px`
                        }}
                      />
                    ) : (
                      <div
                        className="rounded-md"
                        style={{ 
                          backgroundColor: item.color,
                          width: `${DECORATION_ITEM_SIZE}px`, 
                          height: `${DECORATION_ITEM_SIZE}px`
                        }}
                      ></div>
                    )}
                  </div>
                  <div className="flex-1 ml-2">
                    <div className="font-medium text-xs">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 hidden md:block">{item.description}</div>
                    )}
                  </div>
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
                {canvasItems.map((item) => {
                  // Get the base item ID (without timestamp)
                  const baseId = item.id.split('-')[0];
                  // Check if we have the image loaded
                  const itemImage = item.image && decorationImages[baseId];
                  
                  return (
                    <React.Fragment key={item.id}>
                      {itemImage ? (
                        <KonvaImage
                          image={itemImage}
                          x={item.x}
                          y={item.y}
                          width={item.width}
                          height={item.height}
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
                      ) : (
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
                      )}
                    </React.Fragment>
                  );
                })}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuneralRoomPage; 
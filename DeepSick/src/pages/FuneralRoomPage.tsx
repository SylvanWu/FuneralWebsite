import React, { useState, useRef, useEffect, useCallback, useReducer } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer, Group, Circle } from 'react-konva';
import { 
  FuneralRoom, 
  getFuneralRoomById, 
  saveFuneralRoom, 
  updateCanvasItems 
} from '../services/funeralRoomDatabase';
import DeceasedImage from '../components/DeceasedImage';
import Cropper from 'react-easy-crop';
import { VectorToolbar, VectorItem } from '../components/VectorToolbar';

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
const CROP_IMAGE_SIZE = 128; 

// Size constant for decoration items
const DECORATION_ITEM_SIZE = 50; // 50x50px

// Define the selection threshold for resize handles
const ANCHOR_STROKE_WIDTH = 1;
const RESIZE_HANDLE_SIZE = 8;

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
    canvasItems?: CanvasItem[];
  } | null;

  // Define reducer for room state management
  type RoomAction = 
    | { type: 'SET_ALL'; payload: { name: string; password: string; backgroundImage: string; funeralType: string; deceasedImage?: string } }
    | { type: 'UPDATE_FIELD'; field: string; value: string };

  // Reducer function
  const roomReducer = (state: {
    funeralType: string;
    backgroundImage: string;
    password: string;
    name: string;
    deceasedImage?: string;
  }, action: RoomAction) => {
    switch (action.type) {
      case 'SET_ALL':
        return { ...state, ...action.payload };
      case 'UPDATE_FIELD':
        return { ...state, [action.field]: action.value };
      default:
        return state;
    }
  };

  // State to hold funeral room data
  const [state, dispatch] = useReducer(roomReducer, {
    funeralType: locationState?.funeralType || 'church',
    backgroundImage: locationState?.backgroundImage || '',
    password: locationState?.password || '',
    name: locationState?.name || '',
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
  
  // Add background image status
  const [backgroundImg, setBackgroundImg] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  // State to store loaded decoration images
  const [decorationImages, setDecorationImages] = useState<{[key: string]: HTMLImageElement}>({});
  
  // Add state for toolbar collapse
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
  
  // Add refs for transform operations
  const transformerRef = useRef<any>(null);
  
  // Function to get background image, with fallback to mapping if needed
  const getBackgroundImage = useCallback(() => {
    // Check if we have state.funeralType and it exists in the mapping
    if (state.funeralType && state.funeralType in backgroundImageMap) {
      const type = state.funeralType as keyof typeof backgroundImageMap;
      console.log('Using mapped image for type:', type);
      return backgroundImageMap[type];
    }
    
    // Fallback to church image
    console.log('No matching type found, using default church image');
    return churchImage;
  }, [state.funeralType]);
  
  // Load funeral room data from database on mount
  useEffect(() => {
    // If we already have location state with funeral type, apply it immediately
    if (locationState) {
      console.log('Using location state for initial load:', locationState);
      dispatch({
        type: 'SET_ALL',
        payload: {
          name: locationState.name || '',
          password: locationState.password || '',
          backgroundImage: locationState.backgroundImage || '',
          funeralType: locationState.funeralType || 'church',
        }
      });
      
      // Set canvas items if they exist in the location state
      if (locationState.canvasItems && Array.isArray(locationState.canvasItems)) {
        setCanvasItems(locationState.canvasItems);
      }
    }
    
    const loadFuneralRoom = async () => {
      if (!roomId) return;
      
      setIsLoading(true);
      try {
        // Get password from location state if available
        const initialPassword = locationState?.password || '';
        
        // Get funeral room data from the MongoDB API
        const roomData = await getFuneralRoomById(roomId, initialPassword);
        
        if (roomData) {
          // Update state with room data
          dispatch({
            type: 'SET_ALL',
            payload: {
              name: roomData.deceasedName,
              password: roomData.password,
              backgroundImage: roomData.backgroundImage,
              funeralType: roomData.funeralType,
              deceasedImage: roomData.deceasedImage,
            }
          });
          
          // Set canvas items if they exist
          if (roomData.canvasItems && Array.isArray(roomData.canvasItems)) {
            setCanvasItems(roomData.canvasItems);
          }
        }
      } catch (error) {
        console.error('Error loading funeral room:', error);
        // Handle error accordingly, perhaps show a message to the user
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFuneralRoom();
  }, [roomId, locationState]);
  
  // Load background image on mount
  useEffect(() => {
    const bgImage = new Image();
    bgImage.src = getBackgroundImage();
    bgImage.onload = () => {
      setBackgroundImg(bgImage);
      
      // Calculate canvas size enforcing 16:9 aspect ratio
      const aspectRatio = 16/9;
      const sidebarWidth = isToolbarCollapsed ? 48 : 220;
      const horizontalPadding = 40;
      
      // Start with available width
      const availableWidth = window.innerWidth - sidebarWidth - (horizontalPadding * 2);
      const availableHeight = window.innerHeight - 220;
      
      // Calculate dimensions based on 16:9 ratio
      let canvasWidth = availableWidth;
      let canvasHeight = canvasWidth / aspectRatio;
      
      // If height exceeds available height, scale down
      if (canvasHeight > availableHeight) {
        canvasHeight = availableHeight;
        canvasWidth = canvasHeight * aspectRatio;
      }
      
      // Set canvas size
      setCanvasSize({
        width: Math.floor(canvasWidth),
        height: Math.floor(canvasHeight)
      });
    };
    bgImage.onerror = () => {
      console.error('Failed to load background image');
    };
  }, [state.funeralType, isToolbarCollapsed, getBackgroundImage]);
  
  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (backgroundImg) {
        // Maintain 16:9 aspect ratio on resize
        const aspectRatio = 16/9;
        const sidebarWidth = isToolbarCollapsed ? 48 : 220;
        const horizontalPadding = 40;
        
        const availableWidth = window.innerWidth - sidebarWidth - (horizontalPadding * 2);
        const availableHeight = window.innerHeight - 220;
        
        let canvasWidth = availableWidth;
        let canvasHeight = canvasWidth / aspectRatio;
        
        if (canvasHeight > availableHeight) {
          canvasHeight = availableHeight;
          canvasWidth = canvasHeight * aspectRatio;
        }
        
        setCanvasSize({
          width: Math.floor(canvasWidth),
          height: Math.floor(canvasHeight)
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [backgroundImg, isToolbarCollapsed]);
  
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
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'deceasedImage',
        value: croppedImage,
      });
      
      // Save to database
      if (roomId) {
        console.log('Saving to database...');
        // Get current funeral room data with password if possible
        const existingRoom = await getFuneralRoomById(roomId, state.password);
        
        const updatedRoom: FuneralRoom = existingRoom ? {
          ...existingRoom,
          deceasedImage: croppedImage,
          updatedAt: Date.now(),
        } : {
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
  }, [imageToCrop, croppedAreaPixels, roomId, state, canvasItems, dispatch, setIsCropping, setImageToCrop, setSaveMessage, setUploadError]);
  
  // Cancel cropping
  const handleCancelCrop = useCallback(() => {
    setIsCropping(false);
    setImageToCrop(null);
  }, [setIsCropping, setImageToCrop]);
  
  // Function to remove deceased image
  const handleRemoveDeceasedImage = () => {
    // Update state
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'deceasedImage',
      value: '',
    });
    
    // Save changes
    handleSave();
  };
  
  // Function to add a new item to the canvas
  const handleAddItem = (item: { id: string; color: string; name: string; image?: string; description?: string }) => {
    // Adjust the position of the new item to be in the center of the canvas
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
    
    const updatedItems = [...canvasItems, newItem];
    setCanvasItems(updatedItems);
    
    // Auto-save when adding an item
    saveToDatabase(updatedItems).catch(err => 
      console.error('Error saving after adding item:', err)
    );
  };
  
  // Function to save items to database
  const saveToDatabase = useCallback(async (items: CanvasItem[]) => {
    if (!roomId) return;
    
    try {
      // Use the new MongoDB API to update canvas items with password
      const success = await updateCanvasItems(roomId, items, state.password);
      
      if (success) {
        console.log('Auto-saved funeral room with updated items');
      } else {
        console.error('Failed to auto-save canvas items');
      }
    } catch (error) {
      console.error('Error auto-saving funeral room:', error);
    }
  }, [roomId, state.password]);
  
  // Update transformer whenever selection changes
  useEffect(() => {
    if (transformerRef.current && selectedItemId) {
      // Find the selected node by id
      const stage = stageRef.current;
      if (!stage) return;
      
      const selectedNode = stage.findOne(`#${selectedItemId}`);
      if (selectedNode) {
        // Attach transformer to the selected node
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      // Clear transformer if no selection
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedItemId]);
  
  // Function to remove a selected item with delete icon
  const handleRemoveSelectedItem = useCallback(() => {
    if (!selectedItemId) return;
    
    const updatedItems = canvasItems.filter(item => item.id !== selectedItemId);
    setCanvasItems(updatedItems);
    setSelectedItemId(null);
    
    // Auto-save when removing an item
    saveToDatabase(updatedItems).catch(err => 
      console.error('Error saving after item removal:', err)
    );
  }, [selectedItemId, canvasItems, saveToDatabase]);
  
  // Add keyboard event listener for deleting items with Delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedItemId) {
        handleRemoveSelectedItem();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItemId, handleRemoveSelectedItem]);
  
  // Function to save the funeral room data to the database
  const handleSave = async () => {
    if (!roomId) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Get current funeral room data with password
      const funeralRoom = await getFuneralRoomById(roomId, state.password);
      
      if (funeralRoom) {
        // Update with all current state
        const updatedRoom: FuneralRoom = {
          ...funeralRoom,
          password: state.password,
          deceasedName: state.name,
          funeralType: state.funeralType,
          backgroundImage: state.backgroundImage,
          deceasedImage: state.deceasedImage,
          canvasItems: canvasItems,
          updatedAt: Date.now(),
        };
        
        // Save to database
        await saveFuneralRoom(updatedRoom);
        console.log('Manually saved funeral room with all data');
      } else {
        // Create a new room if it doesn't exist (fallback)
        const newRoom: FuneralRoom = {
          roomId,
          password: state.password,
          deceasedName: state.name,
          funeralType: state.funeralType,
          backgroundImage: state.backgroundImage,
          deceasedImage: state.deceasedImage,
          canvasItems: canvasItems,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await saveFuneralRoom(newRoom);
      }
      
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

  // Handle vector item drag start
  const handleVectorDragStart = (e: React.DragEvent<HTMLDivElement>, item: VectorItem) => {
    // Get stage container bounds
    const stageContainer = stageRef.current?.container();
    if (!stageContainer) return;

    const containerRect = stageContainer.getBoundingClientRect();
    
    // Calculate position relative to stage
    const pos = {
      x: e.clientX - containerRect.left,
      y: e.clientY - containerRect.top
    };

    // Create new canvas item
    const newItem: CanvasItem = {
      id: `${item.id}-${Date.now()}`,
      x: pos.x,
      y: pos.y,
      width: DECORATION_ITEM_SIZE,
      height: DECORATION_ITEM_SIZE,
      color: '#ffffff',
      name: item.name,
      image: item.src
    };

    // Add to canvas items
    const updatedItems = [...canvasItems, newItem];
    setCanvasItems(updatedItems);

    // Load the image
    const img = new Image();
    img.src = item.src;
    img.onload = () => {
      setDecorationImages(prev => ({
        ...prev,
        [item.id]: img
      }));
    };

    // Auto-save
    saveToDatabase(updatedItems).catch(err => 
      console.error('Error saving after adding vector item:', err)
    );
  };

  // Handle vector item click
  const handleVectorItemClick = (item: VectorItem) => {
    // Create new canvas item at the center of the canvas
    const newItem: CanvasItem = {
      id: `${item.id}-${Date.now()}`,
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
      width: DECORATION_ITEM_SIZE,
      height: DECORATION_ITEM_SIZE,
      color: '#ffffff',
      name: item.name,
      image: item.src
    };

    // Add to canvas items
    const updatedItems = [...canvasItems, newItem];
    setCanvasItems(updatedItems);

    // Load the image
    const img = new Image();
    img.src = item.src;
    img.onload = () => {
      setDecorationImages(prev => ({
        ...prev,
        [item.id]: img
      }));
    };

    // Auto-save
    saveToDatabase(updatedItems).catch(err => 
      console.error('Error saving after adding vector item:', err)
    );
  };

  // Handle toolbar collapse
  const handleToolbarCollapse = (isCollapsed: boolean) => {
    setIsToolbarCollapsed(isCollapsed);
  };

  // Handle item transform complete
  const handleTransformEnd = (id: string, e: any) => {
    // Get the node that was transformed
    const node = e.target;
    
    // Update the item with the new position and size
    const updatedItems = canvasItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          x: node.x(),
          y: node.y(),
          width: node.width() * node.scaleX(),
          height: node.height() * node.scaleY()
        };
      }
      return item;
    });
    
    // Update state and save
    setCanvasItems(updatedItems);
    saveToDatabase(updatedItems).catch(err => 
      console.error('Error saving after transform:', err)
    );
    
    // Reset scale to avoid accumulating
    if (node) {
      node.scaleX(1);
      node.scaleY(1);
    }
  };

  // Add item delete button component
  const DeleteButton = ({ visible, x, y, onClick }: { 
    visible: boolean, 
    x: number, 
    y: number, 
    onClick: () => void 
  }) => {
    if (!visible) return null;
    
    return (
      <Group x={x} y={y}>
        <Circle 
          radius={10}
          fill="red"
          stroke="white"
          strokeWidth={1}
        />
        <Text 
          text="×" 
          fill="white"
          fontSize={16}
          align="center"
          verticalAlign="middle"
          x={-6}
          y={-8}
          fontStyle="bold"
        />
        <Rect 
          width={20} 
          height={20} 
          x={-10} 
          y={-10}
          opacity={0}
          onClick={onClick}
          onTap={onClick}
        />
      </Group>
    );
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Vector Toolbar */}
      <VectorToolbar 
        onItemDragStart={handleVectorDragStart}
        onCollapseChange={handleToolbarCollapse}
        onItemClick={handleVectorItemClick}
      />
      
      {/* Main content area with proper margin */}
      <div 
        className={`p-4 h-full ${isToolbarCollapsed ? 'sidebar-collapsed' : ''}`}
        style={{ 
          marginLeft: isToolbarCollapsed ? '48px' : '220px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <div className="container mx-auto py-4 px-4">
          <div className="bg-white bg-opacity-80 rounded-lg p-4 mb-4"
          style={{width: '100vh', height: '100vh'}}>
            {/* Display deceased person's info and image upload section */}
            <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-6">
            {/* Canvas Area */}
            <div className="flex-1 bg-gray-200 rounded-lg shadow-lg overflow-hidden">
              <div className="text-center text-gray-500 py-2">
                <p>Click on items in the left toolbar to add them to the scene. Drag to position them. Items are automatically saved.</p>
              </div>
              <div 
                className="canvas-container" 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  padding: '10px',
                  backgroundColor: '#f0f0f0',
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{ 
                    width: `${canvasSize.width}px`, 
                    height: `${canvasSize.height}px`,
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    margin: '0 auto'
                  }}
                >
                  <Stage
                    ref={stageRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    style={{ 
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <Layer>
                      {/* background image - ensure it fills the container */}
                      {backgroundImg && (
                        <KonvaImage
                          image={backgroundImg}
                          width={canvasSize.width}
                          height={canvasSize.height}
                          listening={false}
                        />
                      )}
                      
                      {/* decorations */}
                      {canvasItems.map((item) => {
                        // Get the base item ID (without timestamp)
                        const baseId = item.id.split('-')[0];
                        // Check if we have the image loaded
                        const itemImage = item.image && decorationImages[baseId];
                        const isSelected = selectedItemId === item.id;
                        
                        return (
                          <React.Fragment key={item.id}>
                            {itemImage ? (
                              <>
                                <KonvaImage
                                  id={item.id}
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
                                    // Auto-save when moving an item
                                    saveToDatabase(updatedItems);
                                  }}
                                  onClick={() => setSelectedItemId(item.id)}
                                  onTap={() => setSelectedItemId(item.id)}
                                  onTransformEnd={(e) => handleTransformEnd(item.id, e)}
                                />
                                
                                {/* Delete button */}
                                <DeleteButton 
                                  visible={isSelected}
                                  x={item.x + item.width}
                                  y={item.y - 10}
                                  onClick={handleRemoveSelectedItem}
                                />
                              </>
                            ) : (
                              <>
                                <Rect
                                  id={item.id}
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
                                    // Auto-save when moving an item
                                    saveToDatabase(updatedItems);
                                  }}
                                  onClick={() => setSelectedItemId(item.id)}
                                  onTap={() => setSelectedItemId(item.id)}
                                  onTransformEnd={(e) => handleTransformEnd(item.id, e)}
                                />
                                
                                {/* Delete button */}
                                <DeleteButton 
                                  visible={isSelected}
                                  x={item.x + item.width}
                                  y={item.y - 10}
                                  onClick={handleRemoveSelectedItem}
                                />
                              </>
                            )}
                          </React.Fragment>
                        );
                      })}
                      
                      {/* Add transformer for resizing */}
                      <Transformer
                        ref={transformerRef}
                        boundBoxFunc={(oldBox, newBox) => {
                          // Limit minimum size
                          if (newBox.width < 20 || newBox.height < 20) {
                            return oldBox;
                          }
                          return newBox;
                        }}
                        anchorStroke="#0096FF"
                        anchorFill="#ffffff"
                        anchorSize={RESIZE_HANDLE_SIZE}
                        anchorStrokeWidth={ANCHOR_STROKE_WIDTH}
                        borderStroke="#0096FF"
                        borderStrokeWidth={1}
                        borderDash={[4, 4]}
                        rotateEnabled={true}
                        enabledAnchors={[
                          'top-left', 'top-right', 
                          'bottom-left', 'bottom-right'
                        ]}
                      />
                      
                    </Layer>
                  </Stage>
                </div>
              </div>
            </div>
          </div>
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
          

        </div>
      </div>
    </div>
  );
};

export default FuneralRoomPage; 
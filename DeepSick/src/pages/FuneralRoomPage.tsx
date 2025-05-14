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
import './FuneralRoomPage.css'; // Import CSS file

// Import background images for direct reference
import churchImage from '../assets/funeralType/churchFuneral.png';
import gardenImage from '../assets/funeralType/gardenFuneral.png';
import forestImage from '../assets/funeralType/forestFuneral.png';
import seasideImage from '../assets/funeralType/seasideFuneral.png';
import starryNightImage from '../assets/funeralType/starryNightFuneral.png';
import chineseTraditionalImage from '../assets/funeralType/chineseTraditionalFuneral.png';

// Import decoration images
import chocolateImage from '../assets/smallPicture/chocolate.png';
import milkImage from '../assets/smallPicture/milk.png';
import strawberryMilkImage from '../assets/smallPicture/streberryMilk.png';
import blueFlowerImage from '../assets/smallPicture/blueFlower.png';
import redTreeImage from '../assets/smallPicture/redTree.png';
import bianfuImage from '../assets/smallPicture/bianfu.png';

// Background image mapping for fallback or replacement
const backgroundImageMap: Record<string, string> = {
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
const ANCHOR_STROKE_WIDTH = 2;
const RESIZE_HANDLE_SIZE = 18; // Increased from 12 to make handles easier to grab

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

// Function to update background image size and position to maintain 16:9 aspect ratio
const updateBackgroundImageFit = (img: HTMLImageElement, stageWidth: number, stageHeight: number) => {
  const stageRatio = stageWidth / stageHeight; // Should be 16/9 = 1.778...
  const imageRatio = img.width / img.height;
  
  let width, height, x = 0, y = 0;
  
  // Ensure the image covers the entire canvas area (object-fit: cover behavior)
  // The goal is to make sure no empty space is visible, even if some part of the image is cropped
  if (imageRatio > stageRatio) {
    // Image is wider than stage (relative to height)
    // Make the height match the stage height and center horizontally
    height = stageHeight;
    width = height * imageRatio; // This will be wider than the stage
    x = (stageWidth - width) / 2; // Center horizontally
  } else {
    // Image is taller than stage (relative to width)
    // Make the width match the stage width and center vertically
    width = stageWidth;
    height = width / imageRatio; // This will be taller than the stage
    y = (stageHeight - height) / 2; // Center vertically
  }
  
  console.log(`Background image fit: stage ${stageWidth}x${stageHeight} (ratio: ${stageRatio.toFixed(2)}), image scaled to ${width.toFixed(0)}x${height.toFixed(0)} (ratio: ${imageRatio.toFixed(2)})`);
  
  return { width, height, x, y };
};

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
  const [showCrop, setShowCrop] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  
  // Add background image status
  const [backgroundImg, setBackgroundImg] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 450 }); // 16:9 ratio
  
  // State to store loaded decoration images
  const [decorationImages, setDecorationImages] = useState<{[key: string]: HTMLImageElement}>({});
  
  // Add state for toolbar collapse
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
  
  // Add refs for transform operations
  const transformerRef = useRef<any>(null);
  
  // Add dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // State to track items that are currently loading
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  
  // Add state for tracking item position during dragging
  const [dragPosition, setDragPosition] = useState<{id: string, x: number, y: number, width: number, height: number} | null>(null);
  
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
        
        try {
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
        } catch (apiError) {
          console.error('API Error loading funeral room:', apiError);
          // Set default values to prevent UI from breaking
          dispatch({
            type: 'SET_ALL',
            payload: {
              name: locationState?.name || 'New Funeral',
              password: initialPassword,
              backgroundImage: '',
              funeralType: locationState?.funeralType || 'church',
              deceasedImage: '',
            }
          });
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
  
  // Function to handle window resize
  const handleResize = useCallback(() => {
    const container = document.querySelector('.canvas-container');
    if (container) {
      // Get the width of the container
      const containerWidth = container.clientWidth;
      
      // Calculate height based on exact 16:9 aspect ratio
      const containerHeight = Math.round(containerWidth * 9 / 16);
      
      setCanvasSize({ 
        width: containerWidth, 
        height: containerHeight
      });
      
      console.log(`Canvas size updated: ${containerWidth}x${containerHeight} (16:9 ratio)`);
    }
  }, []);
  
  // Add window resize handler and initial size calculation
  useEffect(() => {
    // Initial size calculation
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);
  
  // Load background image on mount
  useEffect(() => {
    const loadBackgroundImage = async () => {
      try {
        let imageSrc = '';
        
        // Use custom background if available
        if (state.backgroundImage) {
          imageSrc = state.backgroundImage;
        } 
        // Otherwise use a preset background based on funeral type
        else if (state.funeralType) {
          const type = state.funeralType as keyof typeof backgroundImageMap;
          imageSrc = backgroundImageMap[type] || churchImage; // Fallback to church image
        }
        
        if (!imageSrc) {
          console.warn('No background image source available, using default');
          imageSrc = churchImage; // Final fallback
        }
        
        // Create a new image and wait for it to load
        const img = new Image();
        
        // Set up a Promise to handle success and error scenarios
        const imageLoadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load image: ${imageSrc}`));
          img.src = imageSrc;
        });
        
        // Wrap with timeout to avoid hanging
        const imgWithTimeout = Promise.race([
          imageLoadPromise,
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Image load timed out')), 10000); // 10 second timeout
          })
        ]);
        
        // Set the loaded image to state
        const loadedImg = await imgWithTimeout;
        setBackgroundImg(loadedImg);
        
        // Trigger a resize to update canvas dimensions
        setTimeout(handleResize, 0);
      } catch (error) {
        console.error('Error loading background image:', error);
        // Try to load the default church image as fallback
        try {
          const fallbackImg = new Image();
          fallbackImg.src = churchImage;
          fallbackImg.onload = () => {
            setBackgroundImg(fallbackImg);
            setTimeout(handleResize, 0);
          };
        } catch (fallbackError) {
          console.error('Failed to load fallback image:', fallbackError);
        }
      }
    };
    
    loadBackgroundImage();
  }, [state.backgroundImage, state.funeralType, handleResize]);
  
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
        setShowCrop(true);
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
      setShowCrop(false);
      setImageToCrop('');
      console.log('Crop process completed');
    } catch (error) {
      console.error('Error cropping image:', error);
      setUploadError('Failed to crop image. Please try again.');
    }
  }, [imageToCrop, croppedAreaPixels, roomId, state, canvasItems, dispatch, setShowCrop, setImageToCrop, setSaveMessage, setUploadError]);
  
  // Cancel cropping
  const handleCancelCrop = useCallback(() => {
    setShowCrop(false);
    setImageToCrop('');
  }, [setShowCrop, setImageToCrop]);
  
  // Handle re-upload image (triggers file input click)
  const handleReuploadImage = useCallback(() => {
    // Reset states
    setImageToCrop('');
    setCroppedAreaPixels(null);
    
    // Trigger file input click to select a new file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }, []);
  
  // Add a keyboard listener for Enter key to confirm crop when cropping modal is open
  useEffect(() => {
    if (!showCrop) return;
    
    const handleCropKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSaveCroppedImage();
      } else if (e.key === 'Escape') {
        handleCancelCrop();
      }
    };
    
    window.addEventListener('keydown', handleCropKeyDown);
    return () => {
      window.removeEventListener('keydown', handleCropKeyDown);
    };
  }, [showCrop, handleSaveCroppedImage, handleCancelCrop]);
  
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
      // Export canvas image for auto-save
      let canvasImage = '';
      if (stageRef.current) {
        try {
          // Get the Konva Stage instance
          const stage = stageRef.current;
          
          // Temporarily remove the transformer to avoid capturing it in the image
          const transformer = transformerRef.current;
          let nodes = [];
          if (transformer) {
            nodes = transformer.nodes();
            transformer.nodes([]);
            transformer.getLayer()?.batchDraw();
          }
          
          try {
            // Export the stage as a PNG image
            canvasImage = stage.toDataURL({
              pixelRatio: 2,
              mimeType: 'image/png',
              quality: 1
            });
            console.log('Auto-save: Canvas exported as PNG, length:', canvasImage.length);
          } finally {
            // Restore the transformer even if export fails
            if (transformer && nodes.length > 0) {
              transformer.nodes(nodes);
              transformer.getLayer()?.batchDraw();
            }
          }
        } catch (exportError) {
          console.error('Auto-save: Error exporting canvas:', exportError);
        }
      }
      
      // First try to update canvas items and canvas image together
      const success = await updateCanvasItems(roomId, items, state.password, canvasImage);
      
      if (success) {
        console.log('Auto-saved funeral room with updated items and canvas image');
      } else {
        console.error('Failed to auto-save canvas items and image');
        
        // If direct update failed, try a full room update as fallback
        if (canvasImage && canvasImage.length > 0) {
          console.log('Auto-save: Attempting fallback full room update');
          try {
            // Get current funeral room data
            const funeralRoom = await getFuneralRoomById(roomId, state.password);
            
            if (funeralRoom) {
              // Update with the new canvas image
              const updatedRoom: FuneralRoom = {
                ...funeralRoom,
                canvasItems: items,
                canvasImage: canvasImage,
                updatedAt: Date.now(),
              };
              
              // Save to database
              await saveFuneralRoom(updatedRoom);
              console.log('Auto-save: Fallback room update successful');
            }
          } catch (fullSaveError) {
            console.error('Auto-save: Error with fallback save:', fullSaveError);
          }
        }
      }
    } catch (error) {
      console.error('Error auto-saving funeral room:', error);
    }
  }, [roomId, state.password]);
  
  // Add a transform listener to update delete button position during resize
  useEffect(() => {
    if (!transformerRef.current || !selectedItemId) return;
    
    // Add transform event listener
    const transformer = transformerRef.current as any;
    transformer.on('transform', () => {
      // Get the first selected node (there should only be one)
      const nodes = transformer.nodes();
      if (nodes && nodes.length > 0) {
        const node = nodes[0];
        // Update dragPosition to move the delete button during transform
        setDragPosition({
          id: selectedItemId,
          x: node.x(),
          y: node.y(),
          width: node.width() * node.scaleX(),
          height: node.height() * node.scaleY()
        });
      }
    });
    
    // Cleanup function
    return () => {
      transformer.off('transform');
    };
  }, [selectedItemId]);
  
  // UseEffect for transformer update when selectedItemId changes
  useEffect(() => {
    // Make sure transformer ref exists before trying to use it
    if (!transformerRef.current) return;
    
    // Find the selected node
    if (selectedItemId) {
      const selectedNode = stageRef.current?.findOne(`#${selectedItemId}`);
      
      if (selectedNode) {
        // Attach transformer to the selected node
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else {
      // No selection - clear transformer
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
    
    // Clear drag position when selection changes
    setDragPosition(null);
    
  }, [selectedItemId]);
  
  // Function to handle node transform end
  const handleTransformEnd = (id: string, e: any) => {
    // Get the node that was transformed
    const node = e.target;
    if (!node) return;
    
    // Clear drag position
    setDragPosition(null);
    
    // Calculate the new dimensions based on scale
    const newWidth = Math.round(node.width() * node.scaleX());
    const newHeight = Math.round(node.height() * node.scaleY());
    
    console.log(`Resizing item ${id} to ${newWidth}x${newHeight}`);
    
    // Update the item in the canvasItems array
    const updatedItems = canvasItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          width: newWidth,
          height: newHeight
        };
      }
      return item;
    });
    
    // Reset scale to avoid accumulating transforms
    node.scaleX(1);
    node.scaleY(1);
    node.width(newWidth);
    node.height(newHeight);
    
    // Make sure the stage updates visually
    const layer = node.getLayer();
    if (layer) {
      layer.batchDraw();
    }
    
    // Update state
    setCanvasItems(updatedItems);
    
    // Auto-save the changes to the database
    saveToDatabase(updatedItems).catch(err => 
      console.error('Error saving after transform:', err)
    );
    
    console.log(`Item ${id} transform completed: new size ${newWidth}x${newHeight}`);
  };
  
  // Function to remove a selected item with delete icon
  const handleRemoveSelectedItem = () => {
    if (!selectedItemId) return;
    
    console.log(`Attempting to remove item: ${selectedItemId}`);
    
    // Clear the drag position
    setDragPosition(null);
    
    // Clear transformer nodes
    if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
    
    // Filter out the selected item
    const updatedItems = canvasItems.filter(item => item.id !== selectedItemId);
    
    // Update state
    setCanvasItems(updatedItems);
    setSelectedItemId(null);
    
    // Save to database
    saveToDatabase(updatedItems).catch(err => 
      console.error('Error saving after removing item:', err)
    );
    
    console.log(`Item ${selectedItemId} removed from canvas`);
    
    // Force stage update
    if (stageRef.current) {
      stageRef.current.batchDraw();
    }
  };
  
  // Add keyboard event listener for deleting items with Delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process Delete key press when we have a selected item
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItemId) {
        console.log('Delete key pressed with selected item:', selectedItemId);
        e.preventDefault(); // Prevent default browser action
        handleRemoveSelectedItem();
      }
    };
    
    // Add event listener to stage container if available
    const stageContainer = stageRef.current?.container();
    if (stageContainer) {
      stageContainer.tabIndex = 1; // Make sure the stage can receive focus
      stageContainer.focus(); // Set focus to the stage
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItemId]);
  
  // Function to save the funeral room data to the database
  const handleSave = async () => {
    if (!roomId) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Export the canvas as PNG
      let canvasImage = '';
      if (stageRef.current) {
        try {
          console.log('Stage reference found, attempting to export canvas...');
          
          // Get the Konva Stage instance
          const stage = stageRef.current;
          
          // Temporarily remove the transformer to avoid capturing it in the image
          const transformer = transformerRef.current;
          let nodes = [];
          if (transformer) {
            nodes = transformer.nodes();
            transformer.nodes([]);
            transformer.getLayer()?.batchDraw();
          }
          
          // Force a redraw to ensure the latest state is captured
          stage.getLayer()?.batchDraw();
          
          try {
            // Export the stage as a PNG image
            canvasImage = stage.toDataURL({
              pixelRatio: 2, // Higher quality
              mimeType: 'image/png', // Force PNG format
              quality: 1 // Highest quality
            });
            console.log('Canvas exported as PNG successfully');
            console.log('Canvas image data length:', canvasImage.length);
          } finally {
            // Restore the transformer even if export fails
            if (transformer && nodes.length > 0) {
              transformer.nodes(nodes);
              transformer.getLayer()?.batchDraw();
            }
          }
        } catch (exportError) {
          console.error('Error exporting canvas:', exportError);
        }
      } else {
        console.error('Stage reference (stageRef.current) is null or undefined');
      }
      
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
          canvasImage: canvasImage || funeralRoom.canvasImage, // Use new canvas image or keep existing one
          updatedAt: Date.now(),
        };
        
        // Save to database
        await saveFuneralRoom(updatedRoom);
        console.log('Manually saved funeral room with all data and canvas image');
        
        // Show confirmation dialog
        setIsConfirmOpen(true);
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
          canvasImage: canvasImage,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await saveFuneralRoom(newRoom);
        
        // Show confirmation dialog
        setIsConfirmOpen(true);
      }
    } catch (error) {
      console.error('Error saving funeral room:', error);
      setSaveMessage('Error saving funeral room');
    } finally {
      setIsSaving(false);
    }
  };

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

    // Use the helper function to add the item
    handleAddVectorItem(item, pos);
  };

  // Handle vector item click
  const handleVectorItemClick = (item: VectorItem) => {
    // Place the item at center of canvas
    const position = {
      x: canvasSize.width / 2,
      y: canvasSize.height / 2
    };
    
    // Use the helper function to add the item
    handleAddVectorItem(item, position);
  };

  // Handle toolbar collapse
  const handleToolbarCollapse = (isCollapsed: boolean) => {
    setIsToolbarCollapsed(isCollapsed);
  };

  // Add item delete button component
  const DeleteButton = ({ visible, x, y, onClick, itemId }: { 
    visible: boolean, 
    x: number, 
    y: number, 
    onClick: () => void,
    itemId: string
  }) => {
    if (!visible) return null;
    
    // Use drag position if available and matches this item
    const buttonX = dragPosition && dragPosition.id === itemId 
      ? dragPosition.x + dragPosition.width 
      : x;
    
    const buttonY = dragPosition && dragPosition.id === itemId
      ? dragPosition.y - 14  // Position it above the item with some spacing
      : y - 14;
    
    return (
      <Group 
        x={buttonX} 
        y={buttonY}
        listening={true}
      >
        <Circle 
          radius={14}
          fill="red"
          stroke="white"
          strokeWidth={2}
        />
        <Text 
          text="×" 
          fill="white"
          fontSize={20}
          align="center"
          verticalAlign="middle"
          x={-8}
          y={-10}
          fontStyle="bold"
        />
        <Circle 
          radius={16}
          fill="transparent"
          onClick={onClick}
          onTap={onClick}
          onMouseEnter={(e) => {
            const container = e.target.getStage()?.container();
            if (container) {
              container.style.cursor = 'pointer';
            }
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage()?.container();
            if (container) {
              container.style.cursor = 'default';
            }
          }}
        />
      </Group>
    );
  };

  // Helper function to handle adding a vector item
  const handleAddVectorItem = useCallback((item: VectorItem, position: { x: number, y: number }) => {
    // Track loading state
    setLoadingItems(prev => new Set([...prev, item.id]));
    
    // Create a new image and wait for it to load
    const img = new Image();
    img.src = item.src;
    
    // Set loading feedback
    console.log(`Loading vector image: ${item.name}...`);
    
    // Wait for the image to load before adding the item to the canvas
    img.onload = () => {
      // First update the decorationImages state with the loaded image
      setDecorationImages(prev => ({
        ...prev,
        [item.id]: img
      }));
      
      // Then create the new canvas item
      const newItem: CanvasItem = {
        id: `${item.id}-${Date.now()}`,
        x: position.x,
        y: position.y,
        width: DECORATION_ITEM_SIZE,
        height: DECORATION_ITEM_SIZE,
        color: '#ffffff',
        name: item.name,
        image: item.src
      };
      
      // Finally add to canvas items
      const updatedItems = [...canvasItems, newItem];
      setCanvasItems(updatedItems);
      
      // Remove from loading state
      setLoadingItems(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(item.id);
        return newSet;
      });
      
      // Auto-save
      saveToDatabase(updatedItems).catch(err => 
        console.error('Error saving after adding vector item:', err)
      );
      
      console.log(`Vector image "${item.name}" added at position (${position.x}, ${position.y})`);
    };
    
    // Add error handling
    img.onerror = () => {
      console.error(`Failed to load vector image: ${item.name}`);
      // Remove from loading state
      setLoadingItems(prev => {
        const newSet = new Set([...prev]);
        newSet.delete(item.id);
        return newSet;
      });
    };
  }, [canvasItems, saveToDatabase, setLoadingItems, setDecorationImages]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Image Cropping Modal
  if (showCrop && imageToCrop) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        {/* The explanatory text on the right */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-50">
          <div className="border-2 border-blue-500 rounded-lg p-6 bg-white shadow-lg text-center font-bold text-lg text-blue-700">
            Press <span className="text-blue-600">enter</span> to save<br/>
            and <span className="text-gray-600">esc</span> to exit!
          </div>
        </div>
        {/* Crop pop-up window (without title and description) */}
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl relative">
          <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Confirmation Dialog */}
      {isConfirmOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backdropFilter: 'blur(2px)'
          }}
        >
          <div 
            className="bg-white rounded-lg p-8 w-full mx-4 shadow-2xl transform transition-all"
            style={{ 
              maxWidth: '400px',
              animation: 'slideIn 0.3s ease-out',
              position: 'relative',
              zIndex: 100000
            }}
          >
            <style>
              {`
                @keyframes slideIn {
                  from {
                    opacity: 0;
                    transform: translateY(-20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}
            </style>
            <h3 className="text-2xl font-bold mb-4 text-center">Room Saved Successfully!</h3>
            <div className="mb-6">
              <p className="text-gray-700 mb-2 text-center">Room ID: <span className="font-semibold">{roomId}</span></p>
              <p className="text-gray-600 text-center">Do you want to go back to the funeral hall?</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Continue Editing
              </button>
              <button
                onClick={() => {
                  setIsConfirmOpen(false);
                  navigate('/funeralhall');
                }}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go to Hall
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Vector Toolbar */}
      <VectorToolbar 
        onItemDragStart={handleVectorDragStart}
        onCollapseChange={handleToolbarCollapse}
        onItemClick={handleVectorItemClick}
        loadingItems={loadingItems}
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
          <div className="bg-white bg-opacity-80 rounded-lg p-6 mb-4">
            {/* 1. Room Information at the top */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2 text-center">Funeral Room: {roomId}</h1>
              <p className="text-gray-700 text-center mb-4">
                Type: {state.funeralType} | Password: {state.password}
              </p>
            </div>
            
            {/* 2. Deceased Person Image Upload Section in the middle */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">the one who journeyed on</h2>
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
            
            {/* 3. Canvas (Drawing Board) at the bottom with 16:9 aspect ratio */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Let the farewell bloom</h2>
              <div className="text-center text-gray-500 py-2">
                <p>Click on items in the left toolbar to add them to the scene. Drag to position them. Items are automatically saved.</p>
              </div>
              <div className="canvas-container">
                <div className="canvas-wrapper">
                  <Stage
                    ref={stageRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%'
                    }}
                    onMouseDown={(e) => {
                      // Deselect when clicking on empty area
                      const clickedOnEmpty = e.target === e.target.getStage();
                      
                      if (clickedOnEmpty) {
                        // Clear selection when clicking on empty area
                        setSelectedItemId(null);
                      } else {
                        // Check if clicked on an item
                        const targetNode = e.target;
                        const parent = targetNode.parent;
                        
                        // If it has a parent, we can check if it's an item
                        if (parent) {
                          // Clicked on a draggable item
                          const isItemOrDecorationNode = 
                            parent.className === 'Layer' || 
                            parent.className === 'Group';
                          
                          if (isItemOrDecorationNode) {
                            // Bring clicked item to front
                            targetNode.moveToTop();
                            targetNode.getLayer()?.batchDraw();
                          }
                        }
                      }
                    }}
                  >
                    <Layer>
                      {/* background image - ensure it completely fills the 16:9 container */}
                      {backgroundImg && (() => {
                        const { width, height, x, y } = updateBackgroundImageFit(
                          backgroundImg, 
                          canvasSize.width, 
                          canvasSize.height
                        );
                        
                        return (
                          <KonvaImage
                            image={backgroundImg}
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            listening={false}
                          />
                        );
                      })()}
                      
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
                                  draggable={true}
                                  onMouseEnter={(e) => {
                                    const container = e.target.getStage()?.container();
                                    if (container) {
                                      container.style.cursor = 'move';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    const container = e.target.getStage()?.container();
                                    if (container) {
                                      container.style.cursor = 'default';
                                    }
                                  }}
                                  onDragStart={() => {
                                    // Make sure Transformer doesn't interfere with dragging
                                    if (transformerRef.current) {
                                      transformerRef.current.nodes([]);
                                      transformerRef.current.getLayer()?.batchDraw();
                                    }
                                  }}
                                  onDragMove={(e) => {
                                    // Update drag position for the delete button to follow
                                    setDragPosition({
                                      id: item.id,
                                      x: e.target.x(),
                                      y: e.target.y(),
                                      width: item.width,
                                      height: item.height
                                    });
                                  }}
                                  onDragEnd={(e) => {
                                    // Clear drag position
                                    setDragPosition(null);
                                    
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
                                    
                                    // Reapply transformer if this item is selected
                                    if (selectedItemId === item.id && transformerRef.current) {
                                      const node = e.target;
                                      transformerRef.current.nodes([node]);
                                      transformerRef.current.getLayer()?.batchDraw();
                                    }
                                  }}
                                  onClick={() => {
                                    setSelectedItemId(item.id);
                                    console.log(`Selected item: ${item.id}`);
                                  }}
                                  onTap={() => {
                                    setSelectedItemId(item.id);
                                    console.log(`Selected item: ${item.id}`);
                                  }}
                                  onTransformEnd={(e) => handleTransformEnd(item.id, e)}
                                />
                                
                                {/* Delete button */}
                                <DeleteButton 
                                  visible={isSelected}
                                  x={item.x + item.width}
                                  y={item.y - 14}
                                  onClick={handleRemoveSelectedItem}
                                  itemId={item.id}
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
                                  draggable={true}
                                  onMouseEnter={(e) => {
                                    const container = e.target.getStage()?.container();
                                    if (container) {
                                      container.style.cursor = 'move';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    const container = e.target.getStage()?.container();
                                    if (container) {
                                      container.style.cursor = 'default';
                                    }
                                  }}
                                  onDragStart={() => {
                                    // Make sure Transformer doesn't interfere with dragging
                                    if (transformerRef.current) {
                                      transformerRef.current.nodes([]);
                                      transformerRef.current.getLayer()?.batchDraw();
                                    }
                                  }}
                                  onDragMove={(e) => {
                                    // Update drag position for the delete button to follow
                                    setDragPosition({
                                      id: item.id,
                                      x: e.target.x(),
                                      y: e.target.y(),
                                      width: item.width,
                                      height: item.height
                                    });
                                  }}
                                  onDragEnd={(e) => {
                                    // Clear drag position
                                    setDragPosition(null);
                                    
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
                                    
                                    // Reapply transformer if this item is selected
                                    if (selectedItemId === item.id && transformerRef.current) {
                                      const node = e.target;
                                      transformerRef.current.nodes([node]);
                                      transformerRef.current.getLayer()?.batchDraw();
                                    }
                                  }}
                                  onClick={() => {
                                    setSelectedItemId(item.id);
                                    console.log(`Selected item: ${item.id}`);
                                  }}
                                  onTap={() => {
                                    setSelectedItemId(item.id);
                                    console.log(`Selected item: ${item.id}`);
                                  }}
                                  onTransformEnd={(e) => handleTransformEnd(item.id, e)}
                                />
                                
                                {/* Delete button */}
                                <DeleteButton 
                                  visible={isSelected}
                                  x={item.x + item.width}
                                  y={item.y - 14}
                                  onClick={handleRemoveSelectedItem}
                                  itemId={item.id}
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
                        borderStrokeWidth={2}
                        borderDash={[4, 4]}
                        rotateEnabled={true}
                        padding={8} // Increased from 4 to give more space for interaction
                        keepRatio={false}
                        enabledAnchors={[
                          'top-left', 'top-right', 
                          'bottom-left', 'bottom-right',
                          'middle-left', 'middle-right',
                          'top-center', 'bottom-center'
                        ]}
                        anchorCornerRadius={4} // Increased from 2 for better visual
                        // Additional properties for better hit detection
                        resizeEnabled={true}
                        ignoreStroke={false}
                        centeredScaling={false}
                        anchorDragBoundFunc={(oldPos, newPos, e) => {
                          // Snap to grid for more precise control
                          return {
                            x: Math.round(newPos.x / 5) * 5,
                            y: Math.round(newPos.y / 5) * 5
                          };
                        }}
                        // Make sure we capture events properly
                        onClick={(e) => e.cancelBubble = true}
                        onTap={(e) => e.cancelBubble = true}
                      />
                    </Layer>
                  </Stage>
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="mt-6 text-center">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {isSaving ? 'Saving...' : 'Save Room'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuneralRoomPage; 
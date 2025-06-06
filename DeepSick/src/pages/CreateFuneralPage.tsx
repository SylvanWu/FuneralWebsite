import React, { useState, useRef, useEffect } from 'react';
import { FuneralProvider } from '../context/FuneralContext';
import { useNavigate } from 'react-router-dom';
import funeralCreationBg from '../assets/funeralCreation.png';
// Map funeral types to their respective background images
import churchImage from '../assets/funeralType/churchFuneral.png';
import gardenImage from '../assets/funeralType/gardenFuneral.png';
import forestImage from '../assets/funeralType/forestFuneral.png';
import seasideImage from '../assets/funeralType/seasideFuneral.png';
import starryNightImage from '../assets/funeralType/starryNightFuneral.png';
import chineseTraditionalImage from '../assets/funeralType/chineseTraditionalFuneral.png';
import { saveFuneralRoom, FuneralRoom } from '../services/funeralRoomDatabase';

// Mapping funeral types to their background images
const funeralTypeImages = {
  'church': churchImage,
  'garden': gardenImage,
  'forest': forestImage,
  'seaside': seasideImage,
  'starryNight': starryNightImage,
  'chineseTraditional': chineseTraditionalImage,
};

const CreateFuneralPage: React.FC = () => {
  const navigate = useNavigate();

  // Log image paths on component mount
  useEffect(() => {
    console.log('Church Image Path:', churchImage);
    console.log('Garden Image Path:', gardenImage);
    console.log('Forest Image Path:', forestImage);
    console.log('All funeral image paths:', funeralTypeImages);
  }, []);

  // Handle funeral type selection and pass the selected type and image to funeral room page
  const handleFuneralTypeClick = (type: string, image: string) => {
    // Generate a random 5-digit room number
    const roomId = Math.floor(10000 + Math.random() * 90000).toString();
    
    // Prompt for password
    const password = window.prompt('Please set a room password:');
    const name = window.prompt('Please set the name of the one who journeyed on:');
    
    // If user cancels the prompt, don't proceed
    if (!password) return;
    if(!name) return;
    
    // For debugging
    console.log('Selected Type:', type);
    console.log('Selected Image Path:', image);
    
    // Create and save the funeral room to the database
    const funeralRoom: FuneralRoom = {
      roomId,
      password,
      deceasedName: name,
      funeralType: type,
      backgroundImage: image,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Save to database
    saveFuneralRoom(funeralRoom);
    
    // Navigate to the funeral room with params including the selected funeral type and background image
    navigate(`/funeral-room/${roomId}`, {
      state: {
        funeralType: type,
        backgroundImage: image,
        password,
        name,
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="mb-12">
        
        {/* Large illustration/banner */}
        <div className="w-full h-80 rounded-lg overflow-hidden relative mb-8">
          <img
            src={funeralCreationBg}
            alt="Funeral Creation"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center', 
              width: '65%',
              height: '50%',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
          </div>
        </div>
      </div>
      
      {/* Funeral Type Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-2">Type of funeral</h2>
        <p className="text-lg text-gray-600 mb-8">Choose your favorite scene</p>
        
        {/* Grid of funeral types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Church Funeral */}
          <div className="bg-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div 
              className="h-48 bg-gray-300 relative cursor-pointer" 
              onClick={() => handleFuneralTypeClick('church', churchImage)}
            >
              <img 
                src={churchImage} 
                alt="Church Funeral" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Church Funeral</h3>
              <p className="text-gray-600">
              Sunlit stained glass bathes the casket beneath the church's soaring arches. Gentle organ notes drift over time‑worn pews, carrying quiet farewells.
              </p>
            </div>
          </div>
          
          {/* Card 2: Garden Funeral */}
          <div className="bg-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div 
              className="h-48 bg-gray-300 relative cursor-pointer" 
              onClick={() => handleFuneralTypeClick('garden', gardenImage)}
            >
              <img 
                src={gardenImage} 
                alt="Garden Funeral" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Garden Funeral</h3>
              <p className="text-gray-600">
              A casket rests beneath open sky, framed by flower‑lined paths and sun‑warmed pillars. Birdsongs and rustling leaves replace church bells, offering a farewell woven with nature's quiet grace.
              </p>
            </div>
          </div>
          
          {/* Card 3: Forest Funeral */}
          <div className="bg-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div 
              className="h-48 bg-gray-300 relative cursor-pointer" 
              onClick={() => handleFuneralTypeClick('forest', forestImage)}
            >
              <img 
                src={forestImage} 
                alt="Forest Funeral" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Forest Funeral</h3>
              <p className="text-gray-600">
              Amid towering trunks and whispering leaves, a simple coffin lies cradled by emerald moss. Nature's hush becomes the eulogy, as life returns gently to the forest's eternal cycle.
              </p>
            </div>
          </div>
          
          {/* Card 4: Seaside Funeral */}
          <div className="bg-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div 
              className="h-48 bg-gray-300 relative cursor-pointer" 
              onClick={() => handleFuneralTypeClick('seaside', seasideImage)}
            >
              <img 
                src={seasideImage} 
                alt="Seaside Funeral" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Seaside Funeral</h3>
              <p className="text-gray-600">
              Salt‑tinged winds weave through mourners' quiet words, while the tide offers its rhythmic benediction. Each retreating wave bears their farewells toward the shimmering horizon, folding sorrow into the sea's endless embrace.
              </p>
            </div>
          </div>
          
          {/* Card 5: Starry Night Funeral */}
          <div className="bg-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div 
              className="h-48 bg-gray-300 relative cursor-pointer" 
              onClick={() => handleFuneralTypeClick('starryNight', starryNightImage)}
            >
              <img 
                src={starryNightImage} 
                alt="Starry Night Funeral" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Starry Night Funeral</h3>
              <p className="text-gray-600">
              Beneath a tapestry of twinkling stars, quiet headstones rise from dew‑lit grass. Night's cosmic glow turns every farewell into a wish etched across the sky.
              </p>
            </div>
          </div>
          
          {/* Card 6: Chinese Traditional Funeral */}
          <div className="bg-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div 
              className="h-48 bg-gray-300 relative cursor-pointer" 
              onClick={() => handleFuneralTypeClick('chineseTraditional', chineseTraditionalImage)}
            >
              <img 
                src={chineseTraditionalImage} 
                alt="Chinese Traditional Funeral" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Chinese Traditional Funeral</h3>
              <p className="text-gray-600">
              Red lanterns sway above incense‑lit altars as joss paper and fruit guide the departed onward. Monastic chants drift, each bow marking a serene farewell.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper component with FuneralProvider
const WrappedCreateFuneralPage: React.FC = () => {
  return (
    <FuneralProvider>
      <CreateFuneralPage />
    </FuneralProvider>
  );
};

export default WrappedCreateFuneralPage; 
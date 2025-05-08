import React, { useState } from 'react';
import SceneCard, { SceneType } from './SceneCard';
import funeralScenes from '../data/funeralScenes';
import { useFuneral } from '../context/FuneralContext';

const SceneSelection: React.FC = () => {
  const { state, dispatch } = useFuneral();
  const { selectedScene } = state;
  
  const handleSelectScene = (scene: SceneType) => {
    dispatch({ type: 'SELECT_SCENE', payload: scene });
  };
  
  const handleNext = () => {
    if (!selectedScene) {
      alert('Please select a scene to continue');
      return;
    }
    
    dispatch({ type: 'GO_TO_NEXT_STEP' });
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Type of funeral</h2>
        <p className="text-gray-600">
          Choose your favorite scene
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {funeralScenes.map((scene) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            isSelected={selectedScene?.id === scene.id}
            onSelect={handleSelectScene}
          />
        ))}
      </div>
      
      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          disabled={!selectedScene}
          className={`
            px-6 py-2 rounded-lg font-medium text-white
            ${selectedScene
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SceneSelection; 
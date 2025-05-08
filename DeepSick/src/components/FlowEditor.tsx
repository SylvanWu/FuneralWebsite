import React from 'react';
import { useFuneral } from '../context/FuneralContext';

const FlowEditor: React.FC = () => {
  const { state, dispatch } = useFuneral();
  
  const handleBack = () => {
    dispatch({ type: 'GO_TO_PREVIOUS_STEP' });
  };
  
  const handleNext = () => {
    dispatch({ type: 'GO_TO_NEXT_STEP' });
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Design Your Ceremony</h2>
        <p className="text-gray-600">
          Drag and drop elements to create a personalized funeral ceremony.
        </p>
      </div>
      
      <div className="border border-dashed border-gray-300 rounded-lg p-8 min-h-[400px] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            Flow editor will be implemented here in the next phase
          </p>
          <p className="text-gray-400 text-sm">
            This will be a drag-and-drop interface using react-flow
          </p>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="px-6 py-2 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FlowEditor; 
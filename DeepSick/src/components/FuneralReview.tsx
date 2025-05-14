// FuneralReview Component: Funeral ceremony preview and creation

import React, { useState } from 'react';
import { useFuneral } from '../context/FuneralContext';
import { createFuneral } from '../api/funerals';
import { useNavigate } from 'react-router-dom';

const FuneralReview: React.FC = () => {
  const { state, dispatch } = useFuneral();
  const { title, selectedScene, steps } = state;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [funeralTitle, setFuneralTitle] = useState(title || '');
  const navigate = useNavigate();

  const handleBack = () => {
    dispatch({ type: 'GO_TO_PREVIOUS_STEP' });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFuneralTitle(e.target.value);
  };

  const handleSubmit = async () => {
    if (!funeralTitle.trim()) {
      alert('Please enter a title for the funeral');
      return;
    }

    if (!selectedScene) {
      alert('Please select a scene');
      return;
    }

    // Update title in context
    dispatch({ type: 'SET_TITLE', payload: funeralTitle });

    setIsSubmitting(true);

    try {
      // Call the API to create the funeral
      await createFuneral({
        title: funeralTitle,
        scene: selectedScene.id,
        steps: steps.length ? steps : [
          // Add default steps if none defined yet
          {
            id: 'welcome',
            type: 'welcome',
            title: 'Welcome',
            description: 'Welcome and introduction to the ceremony',
            order: 0
          },
          {
            id: 'farewell',
            type: 'farewell',
            title: 'Farewell',
            description: 'Final farewell and closing words',
            order: 1
          }
        ]
      });

      alert('Funeral created successfully!');
      // Reset state after successful creation
      dispatch({ type: 'RESET_STATE' });
      // Redirect to home or another appropriate page
      navigate('/');
    } catch (error) {
      console.error('Error creating funeral:', error);
      alert('Failed to create funeral. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Review and Confirm</h2>
        <p className="text-gray-600">
          Review the details of the funeral ceremony before creating it.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <label htmlFor="funeralTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Funeral Title
          </label>
          <input
            id="funeralTitle"
            type="text"
            value={funeralTitle}
            onChange={handleTitleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter a title for the funeral ceremony"
          />
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Scene</h3>
          {selectedScene ? (
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
              <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                {selectedScene.imageUrl && (
                  <img
                    src={selectedScene.imageUrl}
                    alt={selectedScene.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <h4 className="font-medium">{selectedScene.name}</h4>
                <p className="text-sm text-gray-600">{selectedScene.description}</p>
              </div>
            </div>
          ) : (
            <p className="text-red-500">No scene selected</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Ceremony Steps</h3>
          {steps.length > 0 ? (
            <ul className="space-y-2">
              {steps.map((step, index) => (
                <li key={step.id} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <h5 className="font-medium">{step.title}</h5>
                      <p className="text-sm text-gray-600">{step.type}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">Default welcome and farewell steps will be added</p>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="px-6 py-2 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedScene || !funeralTitle.trim()}
          className={`
            px-6 py-2 rounded-lg font-medium text-white
            ${(!isSubmitting && selectedScene && funeralTitle.trim())
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? 'Creating...' : 'Create Funeral'}
        </button>
      </div>
    </div>
  );
};

export default FuneralReview; 
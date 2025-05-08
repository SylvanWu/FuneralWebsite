import React from 'react';
import { FuneralProvider, useFuneral } from '../context/FuneralContext';
import SceneSelection from '../components/SceneSelection';
import FlowEditor from '../components/FlowEditor';
import FuneralReview from '../components/FuneralReview';

// Stepper component for navigation
const Stepper: React.FC = () => {
  const { state, dispatch } = useFuneral();
  const { currentStep } = state;
  
  const steps = [
    { id: 'scene-selection', name: 'Scene Selection' },
    { id: 'flow-editor', name: 'Ceremony Design' },
    { id: 'review', name: 'Review & Create' }
  ];
  
  const handleStepClick = (step: string) => {
    dispatch({ type: 'GO_TO_STEP', payload: step as any });
  };
  
  return (
    <div className="flex items-center justify-center mb-8 hidden">
      {/* 根据设计图，暂时隐藏步骤导航器 */}
      <nav className="flex items-center" aria-label="Progress">
        <ol className="flex items-center space-x-8">
          {steps.map((step, stepIdx) => (
            <li key={step.id} className="relative">
              {currentStep === step.id ? (
                <div className="flex items-center" aria-current="step">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full -left-4">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="ml-4 text-sm font-medium text-blue-600">{step.name}</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span 
                    className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 cursor-pointer
                      ${stepIdx < steps.findIndex(s => s.id === currentStep) 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'border-2 border-gray-300 bg-white'
                      }
                    `}
                    onClick={() => {
                      // Only allow going back to previous steps
                      if (stepIdx < steps.findIndex(s => s.id === currentStep)) {
                        handleStepClick(step.id);
                      }
                    }}
                  >
                    {stepIdx < steps.findIndex(s => s.id === currentStep) ? (
                      <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-gray-500">{stepIdx + 1}</span>
                    )}
                  </span>
                  <span className={`ml-4 text-sm font-medium ${
                    stepIdx < steps.findIndex(s => s.id === currentStep) 
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
              )}
              
              {stepIdx !== steps.length - 1 && (
                <div className="absolute top-4 left-4 hidden sm:block -ml-px mt-0.5 h-0.5 w-[calc(100%+1rem)] bg-gray-200" />
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

// Main content based on current step
const StepContent: React.FC = () => {
  const { state } = useFuneral();
  const { currentStep } = state;
  
  switch (currentStep) {
    case 'scene-selection':
      return <SceneSelection />;
    case 'flow-editor':
      return <FlowEditor />;
    case 'review':
      return <FuneralReview />;
    default:
      return <SceneSelection />;
  }
};

// Wrapper component with FuneralProvider
const CreateFuneralPage: React.FC = () => {
  return (
    <FuneralProvider>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold">Funeral Creation</h1>
          
          {/* 示意图区域 */}
          <div className="w-full h-64 my-8 flex items-center justify-center">
            <svg className="w-full max-w-2xl" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="800" height="200" fill="#f3f4f6" rx="8" />
              <text x="400" y="100" fontSize="24" textAnchor="middle" fill="#6b7280">Funeral Ceremony Illustration</text>
              <circle cx="200" cy="100" r="40" fill="#d1d5db" />
              <circle cx="400" cy="100" r="60" fill="#d1d5db" />
              <circle cx="600" cy="100" r="40" fill="#d1d5db" />
            </svg>
          </div>
        </div>
        
        <Stepper />
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <StepContent />
        </div>
      </div>
    </FuneralProvider>
  );
};

export default CreateFuneralPage; 
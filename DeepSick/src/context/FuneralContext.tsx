import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SceneType } from '../components/SceneCard';

// Step type for ceremony steps
export interface CeremonyStep {
  id: string;
  type: string;
  title: string;
  description: string;
  mediaURL?: string;
  order: number;
}

// State interface
interface FuneralState {
  title: string;
  selectedScene: SceneType | null;
  steps: CeremonyStep[];
  currentStep: 'scene-selection' | 'flow-editor' | 'review';
}

// Initial state
const initialState: FuneralState = {
  title: '',
  selectedScene: null,
  steps: [],
  currentStep: 'scene-selection'
};

// Action types
type FuneralAction = 
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SELECT_SCENE'; payload: SceneType }
  | { type: 'ADD_STEP'; payload: CeremonyStep }
  | { type: 'UPDATE_STEP'; payload: CeremonyStep }
  | { type: 'REMOVE_STEP'; payload: string }
  | { type: 'REORDER_STEPS'; payload: CeremonyStep[] }
  | { type: 'GO_TO_NEXT_STEP' }
  | { type: 'GO_TO_PREVIOUS_STEP' }
  | { type: 'GO_TO_STEP'; payload: 'scene-selection' | 'flow-editor' | 'review' }
  | { type: 'RESET_STATE' };

// Reducer function
const funeralReducer = (state: FuneralState, action: FuneralAction): FuneralState => {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.payload };
      
    case 'SELECT_SCENE':
      return { ...state, selectedScene: action.payload };
      
    case 'ADD_STEP':
      return { 
        ...state, 
        steps: [...state.steps, action.payload].sort((a, b) => a.order - b.order) 
      };
      
    case 'UPDATE_STEP':
      return {
        ...state,
        steps: state.steps.map(step => 
          step.id === action.payload.id ? action.payload : step
        )
      };
      
    case 'REMOVE_STEP':
      return {
        ...state,
        steps: state.steps.filter(step => step.id !== action.payload)
      };
      
    case 'REORDER_STEPS':
      return { ...state, steps: action.payload };
      
    case 'GO_TO_NEXT_STEP':
      if (state.currentStep === 'scene-selection') return { ...state, currentStep: 'flow-editor' };
      if (state.currentStep === 'flow-editor') return { ...state, currentStep: 'review' };
      return state;
      
    case 'GO_TO_PREVIOUS_STEP':
      if (state.currentStep === 'review') return { ...state, currentStep: 'flow-editor' };
      if (state.currentStep === 'flow-editor') return { ...state, currentStep: 'scene-selection' };
      return state;
      
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
};

// Context type
interface FuneralContextType {
  state: FuneralState;
  dispatch: React.Dispatch<FuneralAction>;
}

// Create context
const FuneralContext = createContext<FuneralContextType | undefined>(undefined);

// Provider component
export const FuneralProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(funeralReducer, initialState);
  
  return (
    <FuneralContext.Provider value={{ state, dispatch }}>
      {children}
    </FuneralContext.Provider>
  );
};

// Custom hook for using the context
export const useFuneral = () => {
  const context = useContext(FuneralContext);
  if (context === undefined) {
    throw new Error('useFuneral must be used within a FuneralProvider');
  }
  return context;
};

export default FuneralContext; 
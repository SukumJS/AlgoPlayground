import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  AlgorithmStep,
  PlaybackState,
  AlgorithmSlug,
  ArrayElement,
  Graph,
  TreeNode,
  LinkedList,
  StackQueueItem,
} from '@/types';

// ===========================================
// Types
// ===========================================

interface PlaygroundState {
  // Algorithm info
  algorithmSlug: AlgorithmSlug | null;
  algorithmName: string;
  
  // Steps
  steps: AlgorithmStep[];
  currentStepIndex: number;
  
  // Playback
  playbackState: PlaybackState;
  speed: number; // milliseconds between steps
  
  // Input data (varies by algorithm type)
  inputData: unknown;
  
  // Status
  isLoading: boolean;
  error: string | null;
  
  // Session
  sessionId: string | null;
  hasUnsavedChanges: boolean;
}

interface PlaygroundActions {
  // Initialization
  initializePlayground: (params: {
    algorithmSlug: AlgorithmSlug;
    algorithmName: string;
    steps: AlgorithmStep[];
    inputData: unknown;
    startingStep?: number;
    sessionId?: string;
  }) => void;
  
  // Playback controls
  play: () => void;
  pause: () => void;
  stop: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  goToStep: (index: number) => void;
  setSpeed: (speed: number) => void;
  
  // Data management
  setInputData: (data: unknown) => void;
  regenerateSteps: (steps: AlgorithmStep[]) => void;
  
  // Status
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Session
  setSessionId: (id: string | null) => void;
  markChangesSaved: () => void;
  
  // Reset
  reset: () => void;
  resetPlayground: () => void;
}

type PlaygroundStore = PlaygroundState & PlaygroundActions;

// ===========================================
// Initial State
// ===========================================

const initialState: PlaygroundState = {
  algorithmSlug: null,
  algorithmName: '',
  steps: [],
  currentStepIndex: 0,
  playbackState: 'idle',
  speed: 500,
  inputData: null,
  isLoading: false,
  error: null,
  sessionId: null,
  hasUnsavedChanges: false,
};

// ===========================================
// Store
// ===========================================

export const usePlaygroundStore = create<PlaygroundStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // ===========================================
    // Initialization
    // ===========================================
    
    initializePlayground: ({ algorithmSlug, algorithmName, steps, inputData, startingStep = 0, sessionId }) => {
      set({
        algorithmSlug,
        algorithmName,
        steps,
        inputData,
        currentStepIndex: Math.min(startingStep, steps.length - 1),
        playbackState: 'idle',
        isLoading: false,
        error: null,
        sessionId: sessionId || null,
        hasUnsavedChanges: false,
      });
    },

    // ===========================================
    // Playback Controls
    // ===========================================
    
    play: () => {
      const { steps, currentStepIndex, playbackState } = get();
      
      if (steps.length === 0) return;
      
      // If completed, restart from beginning
      if (playbackState === 'completed') {
        set({ currentStepIndex: 0, playbackState: 'playing', hasUnsavedChanges: true });
        return;
      }
      
      // If at the end, don't play
      if (currentStepIndex >= steps.length - 1) {
        set({ playbackState: 'completed' });
        return;
      }
      
      set({ playbackState: 'playing', hasUnsavedChanges: true });
    },

    pause: () => {
      set({ playbackState: 'paused' });
    },

    stop: () => {
      set({
        playbackState: 'idle',
        currentStepIndex: 0,
        hasUnsavedChanges: true,
      });
    },

    stepForward: () => {
      const { steps, currentStepIndex, playbackState } = get();
      
      if (currentStepIndex < steps.length - 1) {
        const newIndex = currentStepIndex + 1;
        set({
          currentStepIndex: newIndex,
          playbackState: newIndex >= steps.length - 1 ? 'completed' : playbackState === 'playing' ? 'playing' : 'paused',
          hasUnsavedChanges: true,
        });
      } else {
        set({ playbackState: 'completed' });
      }
    },

    stepBackward: () => {
      const { currentStepIndex, playbackState } = get();
      
      if (currentStepIndex > 0) {
        set({
          currentStepIndex: currentStepIndex - 1,
          playbackState: playbackState === 'completed' ? 'paused' : playbackState,
          hasUnsavedChanges: true,
        });
      }
    },

    goToStep: (index: number) => {
      const { steps } = get();
      const clampedIndex = Math.max(0, Math.min(index, steps.length - 1));
      
      set({
        currentStepIndex: clampedIndex,
        playbackState: clampedIndex >= steps.length - 1 ? 'completed' : 'paused',
        hasUnsavedChanges: true,
      });
    },

    setSpeed: (speed: number) => {
      set({ speed: Math.max(100, Math.min(2000, speed)) });
    },

    // ===========================================
    // Data Management
    // ===========================================
    
    setInputData: (data: unknown) => {
      set({
        inputData: data,
        hasUnsavedChanges: true,
      });
    },

    regenerateSteps: (steps: AlgorithmStep[]) => {
      set({
        steps,
        currentStepIndex: 0,
        playbackState: 'idle',
        hasUnsavedChanges: true,
      });
    },

    // ===========================================
    // Status
    // ===========================================
    
    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    setError: (error: string | null) => {
      set({ error, isLoading: false });
    },

    // ===========================================
    // Session
    // ===========================================
    
    setSessionId: (id: string | null) => {
      set({ sessionId: id });
    },

    markChangesSaved: () => {
      set({ hasUnsavedChanges: false });
    },

    // ===========================================
    // Reset
    // ===========================================
    
    reset: () => {
      set(initialState);
    },

    resetPlayground: () => {
      const { algorithmSlug, algorithmName, steps, inputData } = get();
      set({
        ...initialState,
        algorithmSlug,
        algorithmName,
        steps,
        inputData,
      });
    },
  }))
);

// ===========================================
// Selectors
// ===========================================

export const selectCurrentStep = (state: PlaygroundStore): AlgorithmStep | null => {
  if (state.steps.length === 0) return null;
  return state.steps[state.currentStepIndex] || null;
};

export const selectProgress = (state: PlaygroundStore) => ({
  current: state.currentStepIndex + 1,
  total: state.steps.length,
  percentage: state.steps.length > 0 
    ? Math.round(((state.currentStepIndex + 1) / state.steps.length) * 100) 
    : 0,
});

export const selectIsPlaying = (state: PlaygroundStore) => state.playbackState === 'playing';
export const selectIsPaused = (state: PlaygroundStore) => state.playbackState === 'paused';
export const selectIsCompleted = (state: PlaygroundStore) => state.playbackState === 'completed';
export const selectCanStepForward = (state: PlaygroundStore) => state.currentStepIndex < state.steps.length - 1;
export const selectCanStepBackward = (state: PlaygroundStore) => state.currentStepIndex > 0;

// ===========================================
// Typed Data Selectors
// ===========================================

export const selectArrayData = (state: PlaygroundStore): ArrayElement[] => {
  const step = selectCurrentStep(state);
  return step?.data?.array || [];
};

export const selectGraphData = (state: PlaygroundStore): Graph | null => {
  const step = selectCurrentStep(state);
  return step?.data?.graph || null;
};

export const selectTreeData = (state: PlaygroundStore): TreeNode | null => {
  const step = selectCurrentStep(state);
  return step?.data?.tree || null;
};

export const selectLinkedListData = (state: PlaygroundStore): LinkedList | null => {
  const step = selectCurrentStep(state);
  return step?.data?.linkedList || null;
};

export const selectStackData = (state: PlaygroundStore): StackQueueItem[] => {
  const step = selectCurrentStep(state);
  return step?.data?.stack || [];
};

export const selectQueueData = (state: PlaygroundStore): StackQueueItem[] => {
  const step = selectCurrentStep(state);
  return step?.data?.queue || [];
};

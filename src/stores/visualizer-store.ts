import { create } from 'zustand';
import { ElementState } from '@/types';

// ===========================================
// Types
// ===========================================

interface VisualizerSettings {
  // Display options
  showValues: boolean;
  showIndices: boolean;
  showPointers: boolean;
  showWeights: boolean; // For graph edges
  
  // Animation options
  animationEnabled: boolean;
  animationDuration: number; // ms
  
  // Color scheme
  colorScheme: 'default' | 'colorblind' | 'high-contrast';
  
  // Size
  elementSize: 'small' | 'medium' | 'large';
  
  // Layout (for graphs/trees)
  layoutDirection: 'horizontal' | 'vertical';
}

interface VisualizerState {
  // Settings
  settings: VisualizerSettings;
  
  // Highlighted elements (for hover/focus)
  highlightedElements: Set<string>;
  
  // Selected elements (for interaction)
  selectedElements: Set<string>;
  
  // Tooltip
  tooltip: {
    visible: boolean;
    content: string;
    x: number;
    y: number;
  } | null;
  
  // Current animation
  isAnimating: boolean;
  animationQueue: string[];
  
  // Code highlighting
  highlightedCodeLines: number[];
  
  // Explanation panel
  showExplanation: boolean;
  currentExplanation: string;
}

interface VisualizerActions {
  // Settings
  updateSettings: (settings: Partial<VisualizerSettings>) => void;
  resetSettings: () => void;
  
  // Highlighting
  highlightElement: (id: string) => void;
  unhighlightElement: (id: string) => void;
  clearHighlights: () => void;
  
  // Selection
  selectElement: (id: string) => void;
  deselectElement: (id: string) => void;
  toggleElementSelection: (id: string) => void;
  clearSelection: () => void;
  
  // Tooltip
  showTooltip: (content: string, x: number, y: number) => void;
  hideTooltip: () => void;
  
  // Animation
  setAnimating: (isAnimating: boolean) => void;
  addToAnimationQueue: (animationId: string) => void;
  removeFromAnimationQueue: (animationId: string) => void;
  clearAnimationQueue: () => void;
  
  // Code highlighting
  setHighlightedCodeLines: (lines: number[]) => void;
  clearCodeHighlights: () => void;
  
  // Explanation
  setExplanation: (explanation: string) => void;
  toggleExplanation: () => void;
  
  // Reset
  reset: () => void;
}

type VisualizerStore = VisualizerState & VisualizerActions;

// ===========================================
// Default Settings
// ===========================================

const defaultSettings: VisualizerSettings = {
  showValues: true,
  showIndices: true,
  showPointers: true,
  showWeights: true,
  animationEnabled: true,
  animationDuration: 300,
  colorScheme: 'default',
  elementSize: 'medium',
  layoutDirection: 'horizontal',
};

// ===========================================
// Initial State
// ===========================================

const initialState: VisualizerState = {
  settings: defaultSettings,
  highlightedElements: new Set(),
  selectedElements: new Set(),
  tooltip: null,
  isAnimating: false,
  animationQueue: [],
  highlightedCodeLines: [],
  showExplanation: true,
  currentExplanation: '',
};

// ===========================================
// Store
// ===========================================

export const useVisualizerStore = create<VisualizerStore>((set, get) => ({
  ...initialState,

  // ===========================================
  // Settings
  // ===========================================
  
  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  resetSettings: () => {
    set({ settings: defaultSettings });
  },

  // ===========================================
  // Highlighting
  // ===========================================
  
  highlightElement: (id) => {
    set((state) => {
      const newHighlights = new Set(state.highlightedElements);
      newHighlights.add(id);
      return { highlightedElements: newHighlights };
    });
  },

  unhighlightElement: (id) => {
    set((state) => {
      const newHighlights = new Set(state.highlightedElements);
      newHighlights.delete(id);
      return { highlightedElements: newHighlights };
    });
  },

  clearHighlights: () => {
    set({ highlightedElements: new Set() });
  },

  // ===========================================
  // Selection
  // ===========================================
  
  selectElement: (id) => {
    set((state) => {
      const newSelection = new Set(state.selectedElements);
      newSelection.add(id);
      return { selectedElements: newSelection };
    });
  },

  deselectElement: (id) => {
    set((state) => {
      const newSelection = new Set(state.selectedElements);
      newSelection.delete(id);
      return { selectedElements: newSelection };
    });
  },

  toggleElementSelection: (id) => {
    set((state) => {
      const newSelection = new Set(state.selectedElements);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return { selectedElements: newSelection };
    });
  },

  clearSelection: () => {
    set({ selectedElements: new Set() });
  },

  // ===========================================
  // Tooltip
  // ===========================================
  
  showTooltip: (content, x, y) => {
    set({
      tooltip: { visible: true, content, x, y },
    });
  },

  hideTooltip: () => {
    set({ tooltip: null });
  },

  // ===========================================
  // Animation
  // ===========================================
  
  setAnimating: (isAnimating) => {
    set({ isAnimating });
  },

  addToAnimationQueue: (animationId) => {
    set((state) => ({
      animationQueue: [...state.animationQueue, animationId],
    }));
  },

  removeFromAnimationQueue: (animationId) => {
    set((state) => ({
      animationQueue: state.animationQueue.filter((id) => id !== animationId),
    }));
  },

  clearAnimationQueue: () => {
    set({ animationQueue: [], isAnimating: false });
  },

  // ===========================================
  // Code Highlighting
  // ===========================================
  
  setHighlightedCodeLines: (lines) => {
    set({ highlightedCodeLines: lines });
  },

  clearCodeHighlights: () => {
    set({ highlightedCodeLines: [] });
  },

  // ===========================================
  // Explanation
  // ===========================================
  
  setExplanation: (explanation) => {
    set({ currentExplanation: explanation });
  },

  toggleExplanation: () => {
    set((state) => ({ showExplanation: !state.showExplanation }));
  },

  // ===========================================
  // Reset
  // ===========================================
  
  reset: () => {
    set({
      ...initialState,
      settings: get().settings, // Preserve settings
    });
  },
}));

// ===========================================
// Selectors
// ===========================================

export const selectIsElementHighlighted = (id: string) => (state: VisualizerStore) => 
  state.highlightedElements.has(id);

export const selectIsElementSelected = (id: string) => (state: VisualizerStore) => 
  state.selectedElements.has(id);

export const selectHasAnimations = (state: VisualizerStore) => 
  state.animationQueue.length > 0;

// ===========================================
// Color Helpers
// ===========================================

export const stateColors: Record<ElementState, { bg: string; border: string; text: string }> = {
  default: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' },
  comparing: { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-800' },
  swapping: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-800' },
  sorted: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-800' },
  current: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-800' },
  visited: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-800' },
  path: { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-800' },
  highlight: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-800' },
  pivot: { bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-800' },
  minimum: { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-800' },
  found: { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-800' },
  'not-found': { bg: 'bg-gray-200', border: 'border-gray-400', text: 'text-gray-600' },
};

export const getStateColor = (state: ElementState, colorScheme: string = 'default') => {
  // For now, return default colors. Can extend for colorblind/high-contrast modes
  return stateColors[state] || stateColors.default;
};

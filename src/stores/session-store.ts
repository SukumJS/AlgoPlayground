import { create } from 'zustand';
import { AlgorithmSlug } from '@/types';

// ===========================================
// Types
// ===========================================

interface SessionData {
  algorithmSlug: AlgorithmSlug;
  currentStep: number;
  totalSteps: number;
  inputData: unknown;
  visualState: unknown;
  isCompleted: boolean;
  lastSavedAt: number;
}

interface SessionState {
  // Current session
  currentSession: SessionData | null;
  
  // Sync status
  isSyncing: boolean;
  lastSyncedAt: number | null;
  syncError: string | null;
  
  // Pending changes
  hasPendingChanges: boolean;
  
  // Auto-save
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // ms
}

interface SessionActions {
  // Session management
  setSession: (session: SessionData) => void;
  updateSession: (updates: Partial<SessionData>) => void;
  clearSession: () => void;
  
  // Sync
  startSync: () => void;
  syncSuccess: () => void;
  syncError: (error: string) => void;
  
  // Pending changes
  markPendingChanges: () => void;
  clearPendingChanges: () => void;
  
  // Auto-save settings
  setAutoSave: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  
  // Save to server
  saveSession: () => Promise<void>;
  loadSession: (algorithmSlug: AlgorithmSlug) => Promise<SessionData | null>;
  
  // Reset
  reset: () => void;
}

type SessionStore = SessionState & SessionActions;

// ===========================================
// Initial State
// ===========================================

const initialState: SessionState = {
  currentSession: null,
  isSyncing: false,
  lastSyncedAt: null,
  syncError: null,
  hasPendingChanges: false,
  autoSaveEnabled: true,
  autoSaveInterval: 30000, // 30 seconds
};

// ===========================================
// Store
// ===========================================

export const useSessionStore = create<SessionStore>((set, get) => ({
  ...initialState,

  // ===========================================
  // Session Management
  // ===========================================
  
  setSession: (session) => {
    set({
      currentSession: session,
      hasPendingChanges: false,
    });
  },

  updateSession: (updates) => {
    const { currentSession } = get();
    if (!currentSession) return;
    
    set({
      currentSession: { ...currentSession, ...updates },
      hasPendingChanges: true,
    });
  },

  clearSession: () => {
    set({
      currentSession: null,
      hasPendingChanges: false,
    });
  },

  // ===========================================
  // Sync Status
  // ===========================================
  
  startSync: () => {
    set({ isSyncing: true, syncError: null });
  },

  syncSuccess: () => {
    set({
      isSyncing: false,
      lastSyncedAt: Date.now(),
      syncError: null,
      hasPendingChanges: false,
    });
  },

  syncError: (error) => {
    set({
      isSyncing: false,
      syncError: error,
    });
  },

  // ===========================================
  // Pending Changes
  // ===========================================
  
  markPendingChanges: () => {
    set({ hasPendingChanges: true });
  },

  clearPendingChanges: () => {
    set({ hasPendingChanges: false });
  },

  // ===========================================
  // Auto-save Settings
  // ===========================================
  
  setAutoSave: (enabled) => {
    set({ autoSaveEnabled: enabled });
  },

  setAutoSaveInterval: (interval) => {
    set({ autoSaveInterval: Math.max(5000, interval) }); // Minimum 5 seconds
  },

  // ===========================================
  // Server Operations
  // ===========================================
  
  saveSession: async () => {
    const { currentSession, isSyncing } = get();
    
    if (!currentSession || isSyncing) return;
    
    get().startSync();
    
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithmSlug: currentSession.algorithmSlug,
          currentStep: currentSession.currentStep,
          totalSteps: currentSession.totalSteps,
          inputData: currentSession.inputData,
          visualState: currentSession.visualState,
          isCompleted: currentSession.isCompleted,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save session');
      }
      
      get().syncSuccess();
    } catch (error) {
      get().syncError(error instanceof Error ? error.message : 'Unknown error');
    }
  },

  loadSession: async (algorithmSlug) => {
    get().startSync();
    
    try {
      const response = await fetch(`/api/sessions?algorithmSlug=${algorithmSlug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          get().syncSuccess();
          return null;
        }
        throw new Error('Failed to load session');
      }
      
      const data = await response.json();
      
      if (data.session) {
        const session: SessionData = {
          algorithmSlug: data.session.algorithmSlug,
          currentStep: data.session.currentStep,
          totalSteps: data.session.totalSteps,
          inputData: data.session.inputData,
          visualState: data.session.visualState,
          isCompleted: data.session.isCompleted,
          lastSavedAt: new Date(data.session.updatedAt).getTime(),
        };
        
        get().setSession(session);
        get().syncSuccess();
        return session;
      }
      
      get().syncSuccess();
      return null;
    } catch (error) {
      get().syncError(error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  },

  // ===========================================
  // Reset
  // ===========================================
  
  reset: () => {
    set(initialState);
  },
}));

// ===========================================
// Selectors
// ===========================================

export const selectHasSession = (state: SessionStore) => state.currentSession !== null;
export const selectNeedsSave = (state: SessionStore) => state.hasPendingChanges && !state.isSyncing;
export const selectSyncStatus = (state: SessionStore) => ({
  isSyncing: state.isSyncing,
  lastSyncedAt: state.lastSyncedAt,
  error: state.syncError,
});

// ===========================================
// Auto-save Hook Helper
// ===========================================

export const createAutoSaveInterval = (
  store: SessionStore,
  callback: () => void
): NodeJS.Timeout | null => {
  if (!store.autoSaveEnabled) return null;
  
  return setInterval(() => {
    if (store.hasPendingChanges && !store.isSyncing) {
      callback();
    }
  }, store.autoSaveInterval);
};

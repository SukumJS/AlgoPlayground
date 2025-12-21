import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ===========================================
// Types
// ===========================================

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarWidth: number;
  
  // Panels
  codePanelOpen: boolean;
  codePanelHeight: number;
  explanationPanelOpen: boolean;
  
  // Modals
  activeModal: string | null;
  modalData: unknown;
  
  // Notifications
  notifications: Notification[];
  
  // Theme (for future use)
  theme: 'light' | 'dark' | 'system';
  
  // Layout preferences
  visualizerPosition: 'left' | 'center' | 'right';
  compactMode: boolean;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // ms, 0 for persistent
  createdAt: number;
}

interface UIActions {
  // Sidebar
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
  
  // Panels
  toggleCodePanel: () => void;
  setCodePanelHeight: (height: number) => void;
  toggleExplanationPanel: () => void;
  
  // Modals
  openModal: (modalId: string, data?: unknown) => void;
  closeModal: () => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Layout
  setVisualizerPosition: (position: 'left' | 'center' | 'right') => void;
  toggleCompactMode: () => void;
  
  // Reset
  reset: () => void;
}

type UIStore = UIState & UIActions;

// ===========================================
// Initial State
// ===========================================

const initialState: UIState = {
  sidebarOpen: true,
  sidebarWidth: 280,
  codePanelOpen: true,
  codePanelHeight: 200,
  explanationPanelOpen: true,
  activeModal: null,
  modalData: null,
  notifications: [],
  theme: 'light',
  visualizerPosition: 'center',
  compactMode: false,
};

// ===========================================
// Store
// ===========================================

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ===========================================
      // Sidebar
      // ===========================================
      
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      setSidebarWidth: (width) => {
        set({ sidebarWidth: Math.max(200, Math.min(400, width)) });
      },

      // ===========================================
      // Panels
      // ===========================================
      
      toggleCodePanel: () => {
        set((state) => ({ codePanelOpen: !state.codePanelOpen }));
      },

      setCodePanelHeight: (height) => {
        set({ codePanelHeight: Math.max(100, Math.min(500, height)) });
      },

      toggleExplanationPanel: () => {
        set((state) => ({ explanationPanelOpen: !state.explanationPanelOpen }));
      },

      // ===========================================
      // Modals
      // ===========================================
      
      openModal: (modalId, data) => {
        set({ activeModal: modalId, modalData: data });
      },

      closeModal: () => {
        set({ activeModal: null, modalData: null });
      },

      // ===========================================
      // Notifications
      // ===========================================
      
      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = {
          ...notification,
          id,
          createdAt: Date.now(),
          duration: notification.duration ?? 5000,
        };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));
        
        // Auto-remove after duration (if not persistent)
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
        
        return id;
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // ===========================================
      // Theme
      // ===========================================
      
      setTheme: (theme) => {
        set({ theme });
      },

      // ===========================================
      // Layout
      // ===========================================
      
      setVisualizerPosition: (position) => {
        set({ visualizerPosition: position });
      },

      toggleCompactMode: () => {
        set((state) => ({ compactMode: !state.compactMode }));
      },

      // ===========================================
      // Reset
      // ===========================================
      
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'algoplayground-ui',
      partialize: (state) => ({
        // Only persist these preferences
        theme: state.theme,
        sidebarWidth: state.sidebarWidth,
        codePanelHeight: state.codePanelHeight,
        visualizerPosition: state.visualizerPosition,
        compactMode: state.compactMode,
      }),
    }
  )
);

// ===========================================
// Selectors
// ===========================================

export const selectIsModalOpen = (modalId: string) => (state: UIStore) => 
  state.activeModal === modalId;

export const selectNotificationCount = (state: UIStore) => 
  state.notifications.length;

export const selectLatestNotification = (state: UIStore) => 
  state.notifications[state.notifications.length - 1] || null;

// ===========================================
// Notification Helpers
// ===========================================

export const notify = {
  success: (title: string, message?: string) => 
    useUIStore.getState().addNotification({ type: 'success', title, message }),
  
  error: (title: string, message?: string) => 
    useUIStore.getState().addNotification({ type: 'error', title, message, duration: 8000 }),
  
  warning: (title: string, message?: string) => 
    useUIStore.getState().addNotification({ type: 'warning', title, message }),
  
  info: (title: string, message?: string) => 
    useUIStore.getState().addNotification({ type: 'info', title, message }),
};

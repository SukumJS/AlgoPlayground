// Playground store - algorithm execution state
export {
  usePlaygroundStore,
  selectCurrentStep,
  selectProgress,
  selectIsPlaying,
  selectIsPaused,
  selectIsCompleted,
  selectCanStepForward,
  selectCanStepBackward,
  selectArrayData,
  selectGraphData,
  selectTreeData,
  selectLinkedListData,
  selectStackData,
  selectQueueData,
} from './playground-store';

// Visualizer store - animation and display state
export {
  useVisualizerStore,
  selectIsElementHighlighted,
  selectIsElementSelected,
  selectHasAnimations,
  stateColors,
  getStateColor,
} from './visualizer-store';

// Test store - quiz/test state
export {
  useTestStore,
  selectCurrentQuestion,
  selectCurrentAnswer,
  selectProgress as selectTestProgress,
  selectIsFirstQuestion,
  selectIsLastQuestion,
  selectCanSubmit,
  selectAnsweredQuestions,
  selectElapsedTime,
} from './test-store';

// Session store - persistence and sync
export {
  useSessionStore,
  selectHasSession,
  selectNeedsSave,
  selectSyncStatus,
  createAutoSaveInterval,
} from './session-store';

// UI store - user preferences and UI state
export {
  useUIStore,
  selectIsModalOpen,
  selectNotificationCount,
  selectLatestNotification,
  notify,
} from './ui-store';

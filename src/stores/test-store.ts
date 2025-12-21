import { create } from 'zustand';
import {
  Question,
  UserAnswer,
  TestType,
  AlgorithmSlug,
  QuestionType,
} from '@/types';

// ===========================================
// Types
// ===========================================

type TestStatus = 'not-started' | 'in-progress' | 'completed' | 'submitted';

interface TestState {
  // Test info
  algorithmSlug: AlgorithmSlug | null;
  testType: TestType | null;
  
  // Questions
  questions: Question[];
  currentQuestionIndex: number;
  
  // Answers
  answers: Map<string, UserAnswer>;
  
  // Status
  status: TestStatus;
  isLoading: boolean;
  error: string | null;
  
  // Timing
  startTime: number | null;
  questionStartTime: number | null;
  
  // Results (after submission)
  score: number | null;
  totalPoints: number | null;
  percentage: number | null;
}

interface TestActions {
  // Initialization
  initializeTest: (params: {
    algorithmSlug: AlgorithmSlug;
    testType: TestType;
    questions: Question[];
  }) => void;
  
  // Navigation
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  
  // Answering
  setAnswer: (questionId: string, answer: UserAnswer['answer']) => void;
  clearAnswer: (questionId: string) => void;
  
  // Drag and drop specific
  setDragDropOrderAnswer: (questionId: string, orderedIds: string[]) => void;
  setDragDropMatchAnswer: (questionId: string, matches: Record<string, string>) => void;
  
  // Submission
  submitTest: () => void;
  calculateResults: () => { score: number; total: number; percentage: number; answers: UserAnswer[] };
  
  // Status
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Reset
  reset: () => void;
}

type TestStore = TestState & TestActions;

// ===========================================
// Initial State
// ===========================================

const initialState: TestState = {
  algorithmSlug: null,
  testType: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: new Map(),
  status: 'not-started',
  isLoading: false,
  error: null,
  startTime: null,
  questionStartTime: null,
  score: null,
  totalPoints: null,
  percentage: null,
};

// ===========================================
// Store
// ===========================================

export const useTestStore = create<TestStore>((set, get) => ({
  ...initialState,

  // ===========================================
  // Initialization
  // ===========================================
  
  initializeTest: ({ algorithmSlug, testType, questions }) => {
    const now = Date.now();
    set({
      algorithmSlug,
      testType,
      questions,
      currentQuestionIndex: 0,
      answers: new Map(),
      status: 'in-progress',
      isLoading: false,
      error: null,
      startTime: now,
      questionStartTime: now,
      score: null,
      totalPoints: null,
      percentage: null,
    });
  },

  // ===========================================
  // Navigation
  // ===========================================
  
  goToQuestion: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({
        currentQuestionIndex: index,
        questionStartTime: Date.now(),
      });
    }
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        questionStartTime: Date.now(),
      });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({
        currentQuestionIndex: currentQuestionIndex - 1,
        questionStartTime: Date.now(),
      });
    }
  },

  // ===========================================
  // Answering
  // ===========================================
  
  setAnswer: (questionId, answer) => {
    const { answers, questions, questionStartTime } = get();
    const question = questions.find((q) => q.id === questionId);
    
    if (!question) return;
    
    const timeTaken = questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0;
    const isCorrect = checkAnswer(question, answer);
    
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, {
      questionId,
      answer,
      isCorrect,
      timeTaken,
    });
    
    set({ answers: newAnswers });
  },

  clearAnswer: (questionId) => {
    const { answers } = get();
    const newAnswers = new Map(answers);
    newAnswers.delete(questionId);
    set({ answers: newAnswers });
  },

  setDragDropOrderAnswer: (questionId, orderedIds) => {
    get().setAnswer(questionId, orderedIds);
  },

  setDragDropMatchAnswer: (questionId, matches) => {
    get().setAnswer(questionId, matches);
  },

  // ===========================================
  // Submission
  // ===========================================
  
  submitTest: () => {
    const results = get().calculateResults();
    set({
      status: 'submitted',
      score: results.score,
      totalPoints: results.total,
      percentage: results.percentage,
    });
  },

  calculateResults: () => {
    const { questions, answers } = get();
    
    let score = 0;
    let total = 0;
    
    const answersArray: UserAnswer[] = [];
    
    for (const question of questions) {
      const points = question.points || 1;
      total += points;
      
      const userAnswer = answers.get(question.id);
      
      if (userAnswer) {
        answersArray.push(userAnswer);
        if (userAnswer.isCorrect) {
          score += points;
        }
      } else {
        // Question not answered
        answersArray.push({
          questionId: question.id,
          answer: '',
          isCorrect: false,
          timeTaken: 0,
        });
      }
    }
    
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    
    return { score, total, percentage, answers: answersArray };
  },

  // ===========================================
  // Status
  // ===========================================
  
  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error, isLoading: false });
  },

  // ===========================================
  // Reset
  // ===========================================
  
  reset: () => {
    set(initialState);
  },
}));

// ===========================================
// Helper Functions
// ===========================================

function checkAnswer(question: Question, answer: UserAnswer['answer']): boolean {
  const { correctAnswer, questionType } = question;
  
  switch (questionType) {
    case 'multiple-choice':
    case 'true-false':
    case 'fill-blank':
      // Simple string comparison (case-insensitive for fill-blank)
      if (questionType === 'fill-blank') {
        return String(answer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim();
      }
      return answer === correctAnswer;
    
    case 'drag-drop-order':
      // Array comparison
      if (!Array.isArray(answer) || !Array.isArray(correctAnswer)) return false;
      if (answer.length !== correctAnswer.length) return false;
      return answer.every((item, index) => item === correctAnswer[index]);
    
    case 'drag-drop-match':
      // Object comparison
      if (typeof answer !== 'object' || typeof correctAnswer !== 'object') return false;
      const answerObj = answer as Record<string, string>;
      const correctObj = correctAnswer as Record<string, string>;
      const keys = Object.keys(correctObj);
      return keys.every((key) => answerObj[key] === correctObj[key]);
    
    default:
      return false;
  }
}

// ===========================================
// Selectors
// ===========================================

export const selectCurrentQuestion = (state: TestStore): Question | null => {
  if (state.questions.length === 0) return null;
  return state.questions[state.currentQuestionIndex] || null;
};

export const selectCurrentAnswer = (state: TestStore): UserAnswer | null => {
  const question = selectCurrentQuestion(state);
  if (!question) return null;
  return state.answers.get(question.id) || null;
};

export const selectProgress = (state: TestStore) => ({
  current: state.currentQuestionIndex + 1,
  total: state.questions.length,
  answered: state.answers.size,
  percentage: state.questions.length > 0
    ? Math.round((state.answers.size / state.questions.length) * 100)
    : 0,
});

export const selectIsFirstQuestion = (state: TestStore) => state.currentQuestionIndex === 0;
export const selectIsLastQuestion = (state: TestStore) => 
  state.currentQuestionIndex === state.questions.length - 1;

export const selectCanSubmit = (state: TestStore) => 
  state.status === 'in-progress' && state.answers.size === state.questions.length;

export const selectAnsweredQuestions = (state: TestStore): Set<number> => {
  const answered = new Set<number>();
  state.questions.forEach((q, index) => {
    if (state.answers.has(q.id)) {
      answered.add(index);
    }
  });
  return answered;
};

export const selectElapsedTime = (state: TestStore): number => {
  if (!state.startTime) return 0;
  return Math.floor((Date.now() - state.startTime) / 1000);
};

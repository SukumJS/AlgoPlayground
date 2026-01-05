import { adminDb } from './firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// ===========================================
// Types
// ===========================================

export type TestType = 'PRE_TEST' | 'POST_TEST';
export type AlgorithmCategory = 'SORTING' | 'SEARCHING' | 'GRAPH' | 'TREE' | 'LINEAR';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProgress {
  userId: string;
  algorithmSlug: string;
  preTestCompleted: boolean;
  preTestScore?: number | null;
  playgroundCompleted: boolean;
  playgroundTime?: number | null;
  postTestCompleted: boolean;
  postTestScore?: number | null;
  lastAccessedAt: Date;
}

interface PlaygroundSession {
  id: string;
  userId: string;
  algorithmSlug: string;
  currentStep: number;
  totalSteps: number;
  inputData?: unknown;
  visualState?: unknown;
  isCompleted: boolean;
  updatedAt: Date;
}

interface TestResult {
  id: string;
  userId: string;
  algorithmSlug: string;
  testType: TestType;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number;
  completedAt: Date;
  answers?: TestAnswer[];
}

interface TestAnswer {
  questionId: string;
  userAnswer: unknown;
  isCorrect: boolean;
}

// ===========================================
// User Operations
// ===========================================

export async function findOrCreateUser(userData: {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}): Promise<User> {
  const userRef = adminDb.collection('users').doc(userData.id);
  const userDoc = await userRef.get();

  const now = new Date();

  if (userDoc.exists) {
    // Update existing user
    await userRef.update({
      email: userData.email,
      name: userData.name,
      avatarUrl: userData.avatarUrl,
      updatedAt: Timestamp.fromDate(now),
    });

    const updated = await userRef.get();
    const data = updated.data()!;
    return {
      id: userData.id,
      email: data.email,
      name: data.name,
      avatarUrl: data.avatarUrl,
      createdAt: data.createdAt?.toDate() || now,
      updatedAt: now,
    };
  }

  // Create new user
  const newUser = {
    email: userData.email,
    name: userData.name,
    avatarUrl: userData.avatarUrl || null,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  };

  await userRef.set(newUser);

  return {
    id: userData.id,
    ...newUser,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getUserById(id: string): Promise<(User & { userProgress: UserProgress[] }) | null> {
  const userRef = adminDb.collection('users').doc(id);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return null;
  }

  const data = userDoc.data()!;

  // Get user progress
  const progressSnapshot = await adminDb
    .collection('users')
    .doc(id)
    .collection('progress')
    .get();

  const userProgress: UserProgress[] = progressSnapshot.docs.map((doc) => {
    const pData = doc.data();
    return {
      userId: id,
      algorithmSlug: doc.id,
      preTestCompleted: pData.preTestCompleted || false,
      preTestScore: pData.preTestScore ?? null,
      playgroundCompleted: pData.playgroundCompleted || false,
      playgroundTime: pData.playgroundTime ?? null,
      postTestCompleted: pData.postTestCompleted || false,
      postTestScore: pData.postTestScore ?? null,
      lastAccessedAt: pData.lastAccessedAt?.toDate() || new Date(),
    };
  });

  return {
    id,
    email: data.email,
    name: data.name,
    avatarUrl: data.avatarUrl,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    userProgress,
  };
}

// ===========================================
// Playground Session Operations
// ===========================================

export async function getPlaygroundSession(
  userId: string,
  algorithmSlug: string
): Promise<PlaygroundSession | null> {
  const sessionRef = adminDb
    .collection('users')
    .doc(userId)
    .collection('sessions')
    .doc(algorithmSlug);

  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists) {
    return null;
  }

  const data = sessionDoc.data()!;
  return {
    id: sessionDoc.id,
    userId,
    algorithmSlug,
    currentStep: data.currentStep || 0,
    totalSteps: data.totalSteps || 0,
    inputData: data.inputData,
    visualState: data.visualState,
    isCompleted: data.isCompleted || false,
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

export async function savePlaygroundSession(
  userId: string,
  algorithmSlug: string,
  data: {
    currentStep: number;
    totalSteps: number;
    inputData?: unknown;
    visualState?: unknown;
    isCompleted?: boolean;
  }
): Promise<PlaygroundSession> {
  const sessionRef = adminDb
    .collection('users')
    .doc(userId)
    .collection('sessions')
    .doc(algorithmSlug);

  const now = new Date();
  const sessionData = {
    currentStep: data.currentStep,
    totalSteps: data.totalSteps,
    inputData: data.inputData ?? null,
    visualState: data.visualState ?? null,
    isCompleted: data.isCompleted ?? false,
    updatedAt: Timestamp.fromDate(now),
  };

  await sessionRef.set(sessionData, { merge: true });

  return {
    id: algorithmSlug,
    userId,
    algorithmSlug,
    ...sessionData,
    updatedAt: now,
  };
}

export async function deletePlaygroundSession(
  userId: string,
  algorithmSlug: string
): Promise<void> {
  await adminDb
    .collection('users')
    .doc(userId)
    .collection('sessions')
    .doc(algorithmSlug)
    .delete();
}

// ===========================================
// Test Result Operations
// ===========================================

export async function saveTestResult(
  userId: string,
  algorithmSlug: string,
  data: {
    testType: TestType;
    score: number;
    totalPoints: number;
    percentage: number;
    timeTaken?: number;
    answers?: {
      questionId: string;
      answer: unknown;
      isCorrect: boolean;
    }[];
  }
): Promise<TestResult> {
  const now = new Date();
  const testResultRef = adminDb
    .collection('users')
    .doc(userId)
    .collection('testResults')
    .doc();

  const testResultData = {
    algorithmSlug,
    testType: data.testType,
    score: data.score,
    totalQuestions: data.totalPoints,
    percentage: data.percentage,
    timeTaken: data.timeTaken ?? 0,
    completedAt: Timestamp.fromDate(now),
    answers: data.answers?.map((a) => ({
      questionId: a.questionId,
      userAnswer: a.answer,
      isCorrect: a.isCorrect,
    })) ?? [],
  };

  await testResultRef.set(testResultData);

  return {
    id: testResultRef.id,
    userId,
    ...testResultData,
    completedAt: now,
  };
}

export async function getTestResults(
  userId: string,
  options?: {
    algorithmSlug?: string;
    testType?: TestType;
    limit?: number;
  }
): Promise<TestResult[]> {
  let query = adminDb
    .collection('users')
    .doc(userId)
    .collection('testResults')
    .orderBy('completedAt', 'desc') as FirebaseFirestore.Query;

  if (options?.algorithmSlug) {
    query = query.where('algorithmSlug', '==', options.algorithmSlug);
  }

  if (options?.testType) {
    query = query.where('testType', '==', options.testType);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId,
      algorithmSlug: data.algorithmSlug,
      testType: data.testType,
      score: data.score,
      totalQuestions: data.totalQuestions,
      percentage: data.percentage,
      timeTaken: data.timeTaken,
      completedAt: data.completedAt?.toDate() || new Date(),
      answers: data.answers,
    };
  });
}

export async function getLatestTestResult(
  userId: string,
  algorithmSlug: string,
  testType: TestType
): Promise<TestResult | null> {
  const snapshot = await adminDb
    .collection('users')
    .doc(userId)
    .collection('testResults')
    .where('algorithmSlug', '==', algorithmSlug)
    .where('testType', '==', testType)
    .orderBy('completedAt', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  return {
    id: doc.id,
    userId,
    algorithmSlug: data.algorithmSlug,
    testType: data.testType,
    score: data.score,
    totalQuestions: data.totalQuestions,
    percentage: data.percentage,
    timeTaken: data.timeTaken,
    completedAt: data.completedAt?.toDate() || new Date(),
    answers: data.answers,
  };
}

// ===========================================
// User Progress Operations
// ===========================================

export async function getUserProgress(
  userId: string,
  algorithmSlug?: string
): Promise<UserProgress | UserProgress[] | null> {
  if (algorithmSlug) {
    const progressRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('progress')
      .doc(algorithmSlug);

    const progressDoc = await progressRef.get();

    if (!progressDoc.exists) {
      return null;
    }

    const data = progressDoc.data()!;
    return {
      userId,
      algorithmSlug,
      preTestCompleted: data.preTestCompleted || false,
      preTestScore: data.preTestScore ?? null,
      playgroundCompleted: data.playgroundCompleted || false,
      playgroundTime: data.playgroundTime ?? null,
      postTestCompleted: data.postTestCompleted || false,
      postTestScore: data.postTestScore ?? null,
      lastAccessedAt: data.lastAccessedAt?.toDate() || new Date(),
    };
  }

  // Get all progress
  const snapshot = await adminDb
    .collection('users')
    .doc(userId)
    .collection('progress')
    .orderBy('lastAccessedAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      userId,
      algorithmSlug: doc.id,
      preTestCompleted: data.preTestCompleted || false,
      preTestScore: data.preTestScore ?? null,
      playgroundCompleted: data.playgroundCompleted || false,
      playgroundTime: data.playgroundTime ?? null,
      postTestCompleted: data.postTestCompleted || false,
      postTestScore: data.postTestScore ?? null,
      lastAccessedAt: data.lastAccessedAt?.toDate() || new Date(),
    };
  });
}

export async function updateUserProgress(
  userId: string,
  algorithmSlug: string,
  data: {
    preTestCompleted?: boolean;
    preTestScore?: number;
    playgroundCompleted?: boolean;
    playgroundTime?: number;
    postTestCompleted?: boolean;
    postTestScore?: number;
    completed?: boolean;
    practiceTime?: number;
  }
): Promise<UserProgress> {
  const progressRef = adminDb
    .collection('users')
    .doc(userId)
    .collection('progress')
    .doc(algorithmSlug);

  const now = new Date();
  const updateData: Record<string, unknown> = {
    lastAccessedAt: Timestamp.fromDate(now),
  };

  // Map fields
  if (data.preTestCompleted !== undefined) updateData.preTestCompleted = data.preTestCompleted;
  if (data.preTestScore !== undefined) updateData.preTestScore = data.preTestScore;
  if (data.playgroundCompleted !== undefined) updateData.playgroundCompleted = data.playgroundCompleted;
  if (data.playgroundTime !== undefined) updateData.playgroundTime = data.playgroundTime;
  if (data.postTestCompleted !== undefined) updateData.postTestCompleted = data.postTestCompleted;
  if (data.postTestScore !== undefined) updateData.postTestScore = data.postTestScore;
  if (data.completed !== undefined) updateData.playgroundCompleted = data.completed;
  if (data.practiceTime !== undefined) updateData.playgroundTime = data.practiceTime;

  await progressRef.set(updateData, { merge: true });

  const updated = await progressRef.get();
  const updatedData = updated.data() || {};

  return {
    userId,
    algorithmSlug,
    preTestCompleted: updatedData.preTestCompleted || false,
    preTestScore: updatedData.preTestScore ?? null,
    playgroundCompleted: updatedData.playgroundCompleted || false,
    playgroundTime: updatedData.playgroundTime ?? null,
    postTestCompleted: updatedData.postTestCompleted || false,
    postTestScore: updatedData.postTestScore ?? null,
    lastAccessedAt: now,
  };
}

// ===========================================
// Dashboard / Statistics
// ===========================================

export async function getUserStats(userId: string) {
  // Get all progress for user
  const progressSnapshot = await adminDb
    .collection('users')
    .doc(userId)
    .collection('progress')
    .get();

  const progress = progressSnapshot.docs.map((doc) => doc.data());

  // Get all test results for user
  const testResultsSnapshot = await adminDb
    .collection('users')
    .doc(userId)
    .collection('testResults')
    .get();

  // Count total algorithms from local data (since we're not storing algorithms in Firestore)
  // This should match the count from algorithms.ts
  const totalAlgorithms = 14; // Update this if you add more algorithms

  const completedAlgorithms = progress.filter(
    (p) => p.preTestCompleted && p.playgroundCompleted && p.postTestCompleted
  ).length;

  const preTestScores = progress.filter((p) => p.preTestScore != null);
  const averagePreTestScore =
    preTestScores.length > 0
      ? preTestScores.reduce((sum, p) => sum + (p.preTestScore ?? 0), 0) / preTestScores.length
      : 0;

  const postTestScores = progress.filter((p) => p.postTestScore != null);
  const averagePostTestScore =
    postTestScores.length > 0
      ? postTestScores.reduce((sum, p) => sum + (p.postTestScore ?? 0), 0) / postTestScores.length
      : 0;

  const totalPlaygroundTime = progress.reduce(
    (sum, p) => sum + (p.playgroundTime ?? 0),
    0
  );

  return {
    totalAlgorithms,
    completedAlgorithms,
    inProgressAlgorithms: progress.length - completedAlgorithms,
    averagePreTestScore: Math.round(averagePreTestScore * 100) / 100,
    averagePostTestScore: Math.round(averagePostTestScore * 100) / 100,
    improvement: Math.round((averagePostTestScore - averagePreTestScore) * 100) / 100,
    totalPlaygroundTime,
    totalTestsTaken: testResultsSnapshot.size,
  };
}

// ===========================================
// Question Operations (using local data)
// ===========================================

// Note: Questions are stored locally in data/questions.ts
// These functions are kept for API compatibility but use local data
export async function getQuestionsByAlgorithm(
  algorithmSlug: string,
  testType?: TestType
) {
  // Import from local data
  const { getQuestionsByAlgorithm: getLocalQuestions, getQuestionsByAlgorithmAndType } = await import('@/data/questions');
  
  if (testType) {
    return getQuestionsByAlgorithmAndType(algorithmSlug, testType);
  }
  
  return getLocalQuestions(algorithmSlug);
}

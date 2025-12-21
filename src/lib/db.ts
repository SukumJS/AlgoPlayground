import prisma from './prisma';
import { AlgorithmCategory, TestType } from '@prisma/client';

// ===========================================
// User Operations
// ===========================================

export async function findOrCreateUser(userData: {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}) {
  return prisma.user.upsert({
    where: { id: userData.id },
    update: {
      email: userData.email,
      name: userData.name,
      avatarUrl: userData.avatarUrl,
    },
    create: {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      avatarUrl: userData.avatarUrl,
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      userProgress: true,
    },
  });
}

// ===========================================
// Algorithm Operations
// ===========================================

export async function getAllAlgorithms() {
  return prisma.algorithm.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
}

export async function getAlgorithmBySlug(slug: string) {
  return prisma.algorithm.findUnique({
    where: { slug },
  });
}

export async function getAlgorithmsByCategory(category: AlgorithmCategory) {
  return prisma.algorithm.findMany({
    where: { category },
    orderBy: { name: 'asc' },
  });
}

// ===========================================
// Playground Session Operations
// ===========================================

export async function getPlaygroundSession(userId: string, algorithmSlug: string) {
  const algorithm = await getAlgorithmBySlug(algorithmSlug);
  if (!algorithm) return null;

  return prisma.playgroundSession.findUnique({
    where: {
      userId_algorithmId: {
        userId,
        algorithmId: algorithm.id,
      },
    },
    include: {
      algorithm: true,
    },
  });
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
) {
  const algorithm = await getAlgorithmBySlug(algorithmSlug);
  if (!algorithm) throw new Error(`Algorithm not found: ${algorithmSlug}`);

  return prisma.playgroundSession.upsert({
    where: {
      userId_algorithmId: {
        userId,
        algorithmId: algorithm.id,
      },
    },
    update: {
      currentStep: data.currentStep,
      totalSteps: data.totalSteps,
      inputData: data.inputData ?? undefined,
      visualState: data.visualState ?? undefined,
      isCompleted: data.isCompleted ?? false,
    },
    create: {
      userId,
      algorithmId: algorithm.id,
      currentStep: data.currentStep,
      totalSteps: data.totalSteps,
      inputData: data.inputData ?? undefined,
      visualState: data.visualState ?? undefined,
      isCompleted: data.isCompleted ?? false,
    },
  });
}

export async function deletePlaygroundSession(userId: string, algorithmSlug: string) {
  const algorithm = await getAlgorithmBySlug(algorithmSlug);
  if (!algorithm) return null;

  return prisma.playgroundSession.delete({
    where: {
      userId_algorithmId: {
        userId,
        algorithmId: algorithm.id,
      },
    },
  });
}

// ===========================================
// Question Operations
// ===========================================

export async function getQuestionsByAlgorithm(
  algorithmSlug: string,
  testType: TestType
) {
  const algorithm = await getAlgorithmBySlug(algorithmSlug);
  if (!algorithm) return [];

  return prisma.question.findMany({
    where: {
      algorithmId: algorithm.id,
      testType,
    },
    orderBy: { order: 'asc' },
  });
}

// ===========================================
// Test Result Operations
// ===========================================

export async function saveTestResult(
  userId: string,
  algorithmSlug: string,
  testType: TestType,
  data: {
    score: number;
    totalQuestions: number;
    timeTaken?: number;
    answers: {
      questionId: string;
      userAnswer: unknown;
      isCorrect: boolean;
      timeTaken?: number;
    }[];
  }
) {
  const percentage = (data.score / data.totalQuestions) * 100;

  return prisma.testResult.create({
    data: {
      userId,
      algorithmSlug,
      testType,
      score: data.score,
      totalQuestions: data.totalQuestions,
      percentage,
      timeTaken: data.timeTaken,
      answers: {
        create: data.answers.map((answer) => ({
          questionId: answer.questionId,
          userAnswer: answer.userAnswer,
          isCorrect: answer.isCorrect,
          timeTaken: answer.timeTaken,
        })),
      },
    },
    include: {
      answers: true,
    },
  });
}

export async function getTestResults(userId: string, algorithmSlug?: string) {
  return prisma.testResult.findMany({
    where: {
      userId,
      ...(algorithmSlug && { algorithmSlug }),
    },
    include: {
      answers: {
        include: {
          question: true,
        },
      },
    },
    orderBy: { completedAt: 'desc' },
  });
}

export async function getLatestTestResult(
  userId: string,
  algorithmSlug: string,
  testType: TestType
) {
  return prisma.testResult.findFirst({
    where: {
      userId,
      algorithmSlug,
      testType,
    },
    orderBy: { completedAt: 'desc' },
    include: {
      answers: true,
    },
  });
}

// ===========================================
// User Progress Operations
// ===========================================

export async function getUserProgress(userId: string, algorithmSlug?: string) {
  if (algorithmSlug) {
    return prisma.userProgress.findUnique({
      where: {
        userId_algorithmSlug: {
          userId,
          algorithmSlug,
        },
      },
    });
  }

  return prisma.userProgress.findMany({
    where: { userId },
    orderBy: { lastAccessedAt: 'desc' },
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
  }
) {
  return prisma.userProgress.upsert({
    where: {
      userId_algorithmSlug: {
        userId,
        algorithmSlug,
      },
    },
    update: {
      ...data,
      lastAccessedAt: new Date(),
    },
    create: {
      userId,
      algorithmSlug,
      preTestCompleted: data.preTestCompleted ?? false,
      preTestScore: data.preTestScore,
      playgroundCompleted: data.playgroundCompleted ?? false,
      playgroundTime: data.playgroundTime,
      postTestCompleted: data.postTestCompleted ?? false,
      postTestScore: data.postTestScore,
    },
  });
}

// ===========================================
// Dashboard / Statistics
// ===========================================

export async function getUserStats(userId: string) {
  const [progress, testResults, sessions] = await Promise.all([
    prisma.userProgress.findMany({
      where: { userId },
    }),
    prisma.testResult.findMany({
      where: { userId },
    }),
    prisma.playgroundSession.findMany({
      where: { userId },
    }),
  ]);

  const totalAlgorithms = await prisma.algorithm.count();

  const completedAlgorithms = progress.filter(
    (p) => p.preTestCompleted && p.playgroundCompleted && p.postTestCompleted
  ).length;

  const averagePreTestScore =
    progress.filter((p) => p.preTestScore !== null).length > 0
      ? progress
          .filter((p) => p.preTestScore !== null)
          .reduce((sum, p) => sum + (p.preTestScore ?? 0), 0) /
        progress.filter((p) => p.preTestScore !== null).length
      : 0;

  const averagePostTestScore =
    progress.filter((p) => p.postTestScore !== null).length > 0
      ? progress
          .filter((p) => p.postTestScore !== null)
          .reduce((sum, p) => sum + (p.postTestScore ?? 0), 0) /
        progress.filter((p) => p.postTestScore !== null).length
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
    totalTestsTaken: testResults.length,
  };
}

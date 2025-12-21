import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { saveTestResult, getTestResults, getLatestTestResult, updateUserProgress } from '@/lib/db';
import { AlgorithmSlug, TestType } from '@/types';

// ===========================================
// GET /api/tests
// Get test results for user
// ===========================================

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const algorithmSlug = searchParams.get('algorithmSlug') as AlgorithmSlug | null;
    const testType = searchParams.get('testType') as TestType | null;
    const latest = searchParams.get('latest') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Get latest result for specific algorithm and test type
    if (latest && algorithmSlug && testType) {
      const result = await getLatestTestResult(user.id, algorithmSlug, testType);

      if (!result) {
        return NextResponse.json({ result: null });
      }

      return NextResponse.json({
        result: formatTestResult(result),
      });
    }

    // Get all results with optional filters
    const results = await getTestResults(user.id, {
      algorithmSlug: algorithmSlug || undefined,
      testType: testType || undefined,
      limit,
    });

    return NextResponse.json({
      results: results.map(formatTestResult),
    });
  } catch (error) {
    console.error('Error fetching test results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test results' },
      { status: 500 }
    );
  }
}

// ===========================================
// POST /api/tests
// Save a new test result
// ===========================================

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { algorithmSlug, testType, score, totalPoints, timeTaken, answers } = body;

    // Validate required fields
    if (!algorithmSlug || !testType || score === undefined || totalPoints === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate percentage
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    // Save test result
    const result = await saveTestResult(user.id, algorithmSlug, {
      testType,
      score,
      totalPoints,
      percentage,
      timeTaken: timeTaken || 0,
      answers: answers || [],
    });

    // Update user progress with test score
    const progressUpdate: { preTestScore?: number; postTestScore?: number; completed?: boolean } = {};
    
    if (testType === 'PRE_TEST') {
      progressUpdate.preTestScore = percentage;
    } else if (testType === 'POST_TEST') {
      progressUpdate.postTestScore = percentage;
      // Mark as completed if post-test score >= 70%
      if (percentage >= 70) {
        progressUpdate.completed = true;
      }
    }

    await updateUserProgress(user.id, algorithmSlug, progressUpdate);

    return NextResponse.json({
      success: true,
      result: formatTestResult(result),
    });
  } catch (error) {
    console.error('Error saving test result:', error);
    return NextResponse.json(
      { error: 'Failed to save test result' },
      { status: 500 }
    );
  }
}

// ===========================================
// Helper: Format test result for response
// ===========================================

function formatTestResult(result: {
  id: string;
  algorithmSlug: string;
  testType: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number | null;
  completedAt: Date;
  answers?: { questionId: string; userAnswer: unknown; isCorrect: boolean }[];
}) {
  return {
    id: result.id,
    algorithmSlug: result.algorithmSlug,
    testType: result.testType,
    score: result.score,
    totalPoints: result.totalQuestions,
    percentage: result.percentage,
    timeTaken: result.timeTaken ?? 0,
    completedAt: result.completedAt.toISOString(),
    answers: result.answers?.map(a => ({
      questionId: a.questionId,
      answer: a.userAnswer,
      isCorrect: a.isCorrect,
    })),
  };
}

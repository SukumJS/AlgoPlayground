import { NextRequest, NextResponse } from 'next/server';
import { getQuestionsByAlgorithm } from '@/lib/db';
import { 
  getQuestionsByAlgorithm as getLocalQuestions,
  getQuestionsByAlgorithmAndType,
} from '@/data/questions';
import { AlgorithmSlug, TestType } from '@/types';

// ===========================================
// GET /api/questions
// Get questions for an algorithm
// ===========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const algorithmSlug = searchParams.get('algorithmSlug') as AlgorithmSlug | null;
    const testType = searchParams.get('testType') as TestType | null;
    const useDatabase = searchParams.get('useDatabase') === 'true';

    if (!algorithmSlug) {
      return NextResponse.json(
        { error: 'Missing algorithmSlug parameter' },
        { status: 400 }
      );
    }

    let questions;

    if (useDatabase) {
      // Fetch from database
      questions = await getQuestionsByAlgorithm(algorithmSlug);
      
      // Filter by test type if provided
      if (testType) {
        questions = questions.filter((q) => q.testType === testType);
      }

      // Format for response
      questions = questions.map((q) => ({
        id: q.id,
        algorithmSlug: q.algorithmSlug,
        testType: q.testType,
        type: q.questionType,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points,
        order: q.order,
      }));
    } else {
      // Use local data (for development/fallback)
      if (testType) {
        questions = getQuestionsByAlgorithmAndType(algorithmSlug, testType);
      } else {
        questions = getLocalQuestions(algorithmSlug);
      }
    }

    // Shuffle questions for variety (optional)
    const shuffle = searchParams.get('shuffle') === 'true';
    if (shuffle) {
      questions = [...questions].sort(() => Math.random() - 0.5);
    }

    // Limit number of questions
    const limit = parseInt(searchParams.get('limit') || '0', 10);
    if (limit > 0) {
      questions = questions.slice(0, limit);
    }

    return NextResponse.json({
      algorithmSlug,
      testType,
      questions,
      count: questions.length,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

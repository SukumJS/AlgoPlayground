import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserProgress, updateUserProgress, getUserStats } from '@/lib/db';
import { AlgorithmSlug } from '@/types';

// ===========================================
// GET /api/progress
// Get user's overall progress or for specific algorithm
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

    // If algorithmSlug is provided, get specific progress
    if (algorithmSlug) {
      const progress = await getUserProgress(user.id, algorithmSlug);

      if (!progress) {
        return NextResponse.json({
          progress: null,
        });
      }

      return NextResponse.json({
        progress: {
          algorithmSlug: progress.algorithmSlug,
          completed: progress.completed,
          preTestScore: progress.preTestScore,
          postTestScore: progress.postTestScore,
          practiceTime: progress.practiceTime,
          lastAccessedAt: progress.lastAccessedAt?.toISOString(),
        },
      });
    }

    // Otherwise, get overall stats
    const stats = await getUserStats(user.id);

    return NextResponse.json({
      stats: {
        completedAlgorithms: stats.completedAlgorithms,
        totalAlgorithms: stats.totalAlgorithms,
        averagePreTestScore: stats.averagePreTestScore,
        averagePostTestScore: stats.averagePostTestScore,
        improvement: stats.improvement,
        totalPracticeTime: stats.totalPracticeTime,
      },
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// ===========================================
// POST /api/progress
// Update user's progress for an algorithm
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
    const { algorithmSlug, completed, preTestScore, postTestScore, practiceTime } = body;

    if (!algorithmSlug) {
      return NextResponse.json(
        { error: 'Missing algorithmSlug' },
        { status: 400 }
      );
    }

    const progress = await updateUserProgress(user.id, algorithmSlug, {
      completed,
      preTestScore,
      postTestScore,
      practiceTime,
    });

    return NextResponse.json({
      success: true,
      progress: {
        algorithmSlug: progress.algorithmSlug,
        completed: progress.completed,
        preTestScore: progress.preTestScore,
        postTestScore: progress.postTestScore,
        practiceTime: progress.practiceTime,
        lastAccessedAt: progress.lastAccessedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

// ===========================================
// PATCH /api/progress
// Increment practice time for an algorithm
// ===========================================

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { algorithmSlug, practiceTimeIncrement } = body;

    if (!algorithmSlug || typeof practiceTimeIncrement !== 'number') {
      return NextResponse.json(
        { error: 'Missing algorithmSlug or practiceTimeIncrement' },
        { status: 400 }
      );
    }

    // Get current progress
    const currentProgress = await getUserProgress(user.id, algorithmSlug);
    const currentTime = currentProgress?.practiceTime ?? 0;

    // Update with incremented time
    const progress = await updateUserProgress(user.id, algorithmSlug, {
      practiceTime: currentTime + practiceTimeIncrement,
    });

    return NextResponse.json({
      success: true,
      progress: {
        algorithmSlug: progress.algorithmSlug,
        practiceTime: progress.practiceTime,
      },
    });
  } catch (error) {
    console.error('Error incrementing practice time:', error);
    return NextResponse.json(
      { error: 'Failed to increment practice time' },
      { status: 500 }
    );
  }
}

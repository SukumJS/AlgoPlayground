import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPlaygroundSession, savePlaygroundSession, deletePlaygroundSession } from '@/lib/db';
import { AlgorithmSlug } from '@/types';

// ===========================================
// GET /api/sessions?algorithmSlug=xxx
// Get a user's session for a specific algorithm
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
    const algorithmSlug = searchParams.get('algorithmSlug') as AlgorithmSlug;

    if (!algorithmSlug) {
      return NextResponse.json(
        { error: 'Missing algorithmSlug parameter' },
        { status: 400 }
      );
    }

    const session = await getPlaygroundSession(user.id, algorithmSlug);

    if (!session) {
      return NextResponse.json(
        { session: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      session: {
        id: session.id,
        algorithmSlug: session.algorithmSlug,
        currentStep: session.currentStep,
        totalSteps: session.totalSteps,
        inputData: session.inputData,
        visualState: session.visualState,
        updatedAt: session.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// ===========================================
// POST /api/sessions
// Save or update a user's session
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
    const { algorithmSlug, currentStep, totalSteps, inputData, visualState } = body;

    if (!algorithmSlug) {
      return NextResponse.json(
        { error: 'Missing algorithmSlug' },
        { status: 400 }
      );
    }

    const session = await savePlaygroundSession(user.id, algorithmSlug, {
      currentStep: currentStep ?? 0,
      totalSteps: totalSteps ?? 0,
      inputData: inputData ?? null,
      visualState: visualState ?? null,
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        algorithmSlug: session.algorithmSlug,
        currentStep: session.currentStep,
        totalSteps: session.totalSteps,
        inputData: session.inputData,
        visualState: session.visualState,
        updatedAt: session.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error saving session:', error);
    return NextResponse.json(
      { error: 'Failed to save session' },
      { status: 500 }
    );
  }
}

// ===========================================
// DELETE /api/sessions?algorithmSlug=xxx
// Delete a user's session for a specific algorithm
// ===========================================

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const algorithmSlug = searchParams.get('algorithmSlug') as AlgorithmSlug;

    if (!algorithmSlug) {
      return NextResponse.json(
        { error: 'Missing algorithmSlug parameter' },
        { status: 400 }
      );
    }

    await deletePlaygroundSession(user.id, algorithmSlug);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}

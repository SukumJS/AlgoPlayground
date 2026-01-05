import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserStats, getUserProgress } from '@/lib/db';
import { adminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

// ===========================================
// GET /api/user
// Get current user's profile and stats
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
    const includeStats = searchParams.get('includeStats') !== 'false';
    const includeProgress = searchParams.get('includeProgress') === 'true';

    // Base user data
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
    };

    // Include stats if requested
    let stats = null;
    if (includeStats) {
      stats = await getUserStats(user.id);
    }

    // Include detailed progress if requested
    let progress = null;
    if (includeProgress) {
      const progressRecords = await getUserProgress(user.id);

      if (Array.isArray(progressRecords)) {
        progress = progressRecords.map((p) => ({
          algorithmSlug: p.algorithmSlug,
          completed: p.preTestCompleted && p.playgroundCompleted && p.postTestCompleted,
          preTestScore: p.preTestScore,
          postTestScore: p.postTestScore,
          practiceTime: p.playgroundTime,
          lastAccessedAt: p.lastAccessedAt?.toISOString(),
        }));
      }
    }

    return NextResponse.json({
      user: userData,
      stats,
      progress,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// ===========================================
// PATCH /api/user
// Update user profile
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
    const { name } = body;

    // Update user in Firestore
    const userRef = adminDb.collection('users').doc(user.id);
    await userRef.update({
      name: name !== undefined ? name : user.name,
      updatedAt: Timestamp.fromDate(new Date()),
    });

    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data()!;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: updatedData.email,
        name: updatedData.name,
        avatarUrl: updatedData.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// ===========================================
// DELETE /api/user
// Delete user account and all data
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

    const userRef = adminDb.collection('users').doc(user.id);

    // Delete subcollections first
    const subcollections = ['progress', 'sessions', 'testResults'];
    for (const subcollection of subcollections) {
      const snapshot = await userRef.collection(subcollection).get();
      const batch = adminDb.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    // Delete the user document
    await userRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

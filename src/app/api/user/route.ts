import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserStats } from '@/lib/db';
import { prisma } from '@/lib/prisma';

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
      const progressRecords = await prisma.userProgress.findMany({
        where: { userId: user.id },
        orderBy: { lastAccessedAt: 'desc' },
      });

      progress = progressRecords.map((p) => ({
        algorithmSlug: p.algorithmSlug,
        completed: p.completed,
        preTestScore: p.preTestScore,
        postTestScore: p.postTestScore,
        practiceTime: p.practiceTime,
        lastAccessedAt: p.lastAccessedAt?.toISOString(),
      }));
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

    // Only allow updating name for now
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name : user.name,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatarUrl: updatedUser.avatarUrl,
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

    // Delete all user data (cascade should handle related records)
    await prisma.user.delete({
      where: { id: user.id },
    });

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

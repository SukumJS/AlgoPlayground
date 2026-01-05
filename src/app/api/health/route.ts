import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// ===========================================
// GET /api/health
// Health check endpoint
// ===========================================

export async function GET() {
  try {
    // Check Firestore connection
    let dbStatus = 'unknown';
    let dbLatency = 0;
    
    try {
      const start = Date.now();
      // Simple Firestore health check - try to access a collection
      await adminDb.collection('_health').limit(1).get();
      dbLatency = Date.now() - start;
      dbStatus = 'connected';
    } catch (dbError) {
      dbStatus = 'disconnected';
      console.error('Firestore health check failed:', dbError);
    }

    const health = {
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        firestore: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
        },
      },
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}

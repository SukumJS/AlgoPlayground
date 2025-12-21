import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllAlgorithms, 
  getAlgorithmBySlug, 
  getAlgorithmsByCategory,
  getCategoryDisplayName,
} from '@/data/algorithms';
import { AlgorithmSlug, AlgorithmCategory } from '@/types';

// ===========================================
// GET /api/algorithms
// Get all algorithms or filter by category
// ===========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') as AlgorithmSlug | null;
    const category = searchParams.get('category') as AlgorithmCategory | null;

    // Get single algorithm by slug
    if (slug) {
      const algorithm = getAlgorithmBySlug(slug);

      if (!algorithm) {
        return NextResponse.json(
          { error: 'Algorithm not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        algorithm: formatAlgorithm(algorithm),
      });
    }

    // Get algorithms by category
    if (category) {
      const algorithms = getAlgorithmsByCategory(category);
      
      return NextResponse.json({
        category: getCategoryDisplayName(category),
        algorithms: algorithms.map(formatAlgorithm),
      });
    }

    // Get all algorithms grouped by category
    const allAlgorithms = getAllAlgorithms();
    
    // Group by category
    const grouped: Record<string, ReturnType<typeof formatAlgorithm>[]> = {};
    
    for (const algorithm of allAlgorithms) {
      const categoryName = getCategoryDisplayName(algorithm.category);
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(formatAlgorithm(algorithm));
    }

    return NextResponse.json({
      algorithms: allAlgorithms.map(formatAlgorithm),
      grouped,
      totalCount: allAlgorithms.length,
    });
  } catch (error) {
    console.error('Error fetching algorithms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch algorithms' },
      { status: 500 }
    );
  }
}

// ===========================================
// Helper: Format algorithm for response
// ===========================================

function formatAlgorithm(algorithm: ReturnType<typeof getAllAlgorithms>[0]) {
  return {
    slug: algorithm.slug,
    name: algorithm.name,
    description: algorithm.description,
    category: algorithm.category,
    categoryDisplay: getCategoryDisplayName(algorithm.category),
    difficulty: algorithm.difficulty,
    timeComplexity: algorithm.timeComplexity,
    spaceComplexity: algorithm.spaceComplexity,
    stable: algorithm.stable,
    useCases: algorithm.useCases,
  };
}

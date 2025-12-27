import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { usersApi } from '@/lib/api-server';
import { applyRateLimit, addRateLimitHeaders } from '@/lib/rate-limit-helper';

export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { response: rateLimitResponse, rateLimitResult } = await applyRateLimit(request, 'get');
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const users = await usersApi.getAll();
    const response = NextResponse.json({ data: users });
    
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return addRateLimitHeaders(response, rateLimitResult);
  } catch (error: any) {
    console.error('Error en GET /api/permit/v1/users:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener usuarios' },
      { status: error.status || 500 }
    );
  }
}


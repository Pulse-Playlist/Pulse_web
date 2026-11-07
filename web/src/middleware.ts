import { NextRequest, NextResponse } from 'next/server';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

// Sliding window in-memory rate-limit store per IP
const ipBuckets = new Map<string, RateLimitBucket>();

// Limits per 15-second window:
// - API writes (POST/PATCH): max 12 requests per 15s
// - General page / API GET floods: max 60 requests per 15s
const WINDOW_MS = 15_000;
const MAX_API_MUTATION_REQUESTS = 12;
const MAX_GENERAL_REQUESTS = 60;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never rate-limit the rate-limit page itself, static assets, or Next.js internals
  if (
    pathname.startsWith('/rate-limit') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/logos') ||
    pathname.startsWith('/covers') ||
    pathname.startsWith('/data') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const now = Date.now();
  const ip = getClientIp(req);
  const isApiMutation =
    pathname.startsWith('/api/') && (req.method === 'POST' || req.method === 'PATCH');
  const bucketKey = `${ip}:${isApiMutation ? 'mut' : 'gen'}`;
  const limit = isApiMutation ? MAX_API_MUTATION_REQUESTS : MAX_GENERAL_REQUESTS;

  let bucket = ipBuckets.get(bucketKey);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 1, resetAt: now + WINDOW_MS };
    ipBuckets.set(bucketKey, bucket);
  } else {
    bucket.count += 1;
  }

  // Periodic cleanup to avoid memory growth
  if (ipBuckets.size > 2000) {
    for (const [k, v] of ipBuckets.entries()) {
      if (now > v.resetAt) ipBuckets.delete(k);
    }
  }

  if (bucket.count > limit) {
    const retryAfterSec = Math.max(5, Math.ceil((bucket.resetAt - now) / 1000));

    // For API calls, return a 429 JSON response with Retry-After header
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
          retryAfter: retryAfterSec,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSec),
          },
        }
      );
    }

    // For page navigation floods, redirect to the dedicated /rate-limit cooldown page
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/rate-limit';
    redirectUrl.searchParams.set('retry', String(retryAfterSec));
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/types/enums';

// Types for authentication
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: UserRole[];
  discordUserId?: string;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthUser;
}

// Authentication middleware function
export async function authenticate(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Get JWT token from the request
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || !token.sub) {
      return null;
    }

    // In production, you would fetch user data from database
    // For now, return mock user data based on token
    const user: AuthUser = {
      id: token.sub,
      email: token.email || '',
      displayName: token.name || 'User',
      roles: token.roles as UserRole[] || [UserRole.USER],
      discordUserId: token.discordUserId as string
    };

    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Check if user has required role
export function hasRole(user: AuthUser, requiredRole: UserRole): boolean {
  return user.roles.includes(requiredRole);
}

// Check if user has any of the required roles
export function hasAnyRole(user: AuthUser, requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => user.roles.includes(role));
}

// Admin authentication wrapper
export function requireAdmin(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!hasRole(user, UserRole.ADMIN)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = user;
    
    return handler(authenticatedRequest);
  };
}

// Staff (Admin or Moderator) authentication wrapper
export function requireStaff(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!hasAnyRole(user, [UserRole.ADMIN, UserRole.MODERATOR])) {
      return NextResponse.json(
        { success: false, error: 'Staff access required' },
        { status: 403 }
      );
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = user;
    
    return handler(authenticatedRequest);
  };
}

// General authentication wrapper
export function requireAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = user;
    
    return handler(authenticatedRequest);
  };
}

// User ownership verification (user can only access their own data)
export function requireOwnership(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  getUserIdFromRequest: (req: NextRequest) => string | null
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const requestedUserId = getUserIdFromRequest(request);
    
    // Allow if user is admin, staff, or accessing their own data
    if (!hasAnyRole(user, [UserRole.ADMIN, UserRole.MODERATOR]) && 
        user.id !== requestedUserId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = user;
    
    return handler(authenticatedRequest);
  };
}

// Extract user ID from query parameter
export function getUserIdFromQuery(request: NextRequest): string | null {
  const { searchParams } = new URL(request.url);
  return searchParams.get('userId');
}

// Extract user ID from request body
export async function getUserIdFromBody(request: NextRequest): Promise<string | null> {
  try {
    const clonedRequest = request.clone();
    const body = await clonedRequest.json();
    return body.userId || null;
  } catch {
    return null;
  }
}

// Rate limiting (basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < windowStart) {
        rateLimitMap.delete(key);
      }
    }

    // Check current rate
    const current = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
    
    if (current.count >= maxRequests && current.resetTime > now) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Update rate limit
    current.count += 1;
    if (current.resetTime <= now) {
      current.resetTime = now + windowMs;
      current.count = 1;
    }
    rateLimitMap.set(ip, current);

    return null; // Continue processing
  };
}

// Combine multiple middleware
export function combineMiddleware(...middlewares: Array<(req: NextRequest) => Promise<NextResponse | null>>) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    for (const middleware of middlewares) {
      const result = await middleware(request);
      if (result) {
        return result; // Stop processing if middleware returns a response
      }
    }
    return null; // Continue processing
  };
}

// CORS middleware
export function cors(allowedOrigins: string[] = ['http://localhost:3000']) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const origin = request.headers.get('origin');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Max-Age', '86400');
      
      return response;
    }

    return null; // Continue processing for non-preflight requests
  };
}
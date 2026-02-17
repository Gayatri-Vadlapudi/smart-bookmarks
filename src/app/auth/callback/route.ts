import { NextRequest, NextResponse } from 'next/server';

/**
 * This route handles OAuth callback errors (sent as query params).
 * Success callbacks with access tokens come as URL hash fragments,
 * which are never sent to the server - they're handled client-side by onAuthStateChange.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // If there's an error, redirect to home with error indicator
  if (error) {
    console.error(`Auth error: ${error} - ${errorDescription}`);
    return NextResponse.redirect(new URL('/?auth_error=true', request.url));
  }

  // For successful auth, redirect home (hash stays in browser and is handled client-side)
  return NextResponse.redirect(new URL('/', request.url));
}


import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // If there's an error, redirect to home with error
  if (error) {
    console.error(`Auth error: ${error} - ${errorDescription}`);
    return NextResponse.redirect(new URL('/?auth_error=true', request.url));
  }

  // If we have a code, Supabase SDK will handle the session exchange client-side
  // Just redirect back to home, the client-side auth listener will pick up the session
  if (code) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.redirect(new URL('/', request.url));
}

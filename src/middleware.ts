import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(_request: NextRequest) {
  // Pass-through: Supabase v2 stores auth in localStorage, not cookies,
  // so middleware cannot reliably check auth state. Each protected page
  // (e.g. /admin/page.tsx) already verifies the session and admin email
  // client-side, which is the real protection layer.
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}

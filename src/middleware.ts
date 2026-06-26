import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

// Aucune route ciblée : le middleware ne s'exécute sur aucune page.
export const config = {
  matcher: [],
};

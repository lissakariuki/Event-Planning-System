import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/middleware"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // Allow access to invitation routes
  const url = new URL(request.url)
  if (url.pathname.startsWith("/invitations/")) {
    return NextResponse.next()
  }

  return response
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - invitations routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|invitations).*)",
  ],
}

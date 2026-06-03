import { NextResponse, type MiddlewareConfig, type NextRequest } from "next/server"

const publicRoutes = [
  { path: "/login", whenAuthenticated: 'redirect' },
  { path: "/register", whenAuthenticated: 'redirect' },
] as const

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/login"

async function getSession(request: NextRequest) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
    const response = await fetch(`${baseURL}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    })

    if (!response.ok) return null
    
    const data = await response.json()
    return data.session || null
  } catch (error) {
    console.error("Erro ao verificar sessão:", error)
    return null
  }
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const publicRoute = publicRoutes.find(route => route.path === path)

  const authToken = request.cookies.get("better-auth.session_token")
  const session = authToken ? await getSession(request) : null

  if(!session && publicRoute) {
    return NextResponse.next()
  }

  if(!session && !publicRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE
    return NextResponse.redirect(redirectUrl)
  }

  if(session && publicRoute && publicRoute.whenAuthenticated === 'redirect') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/"
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config: MiddlewareConfig = {
 matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
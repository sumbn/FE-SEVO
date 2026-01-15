import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'vi']
const defaultLocale = 'vi'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log("🛣️ [Middleware] Checking path:", pathname);
  
  // 1. Check if the pathname is missing a locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // 2. Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = defaultLocale
    
    // Redirect to /[locale]/[pathname]
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        request.url
      )
    )
  }

  // 3. Set locale in request headers for Server Components to read
  const locale = locales.find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  ) || defaultLocale

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-locale', locale)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api) and all static files (with dots)
    '/((?!api|_next|.*\\..*).*)',
  ],
}



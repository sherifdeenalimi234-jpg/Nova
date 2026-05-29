import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { ADMIN_EMAIL } from '@/lib/constants'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;

  console.log(`[Middleware] Path: ${pathname}, User: ${user?.email || 'Guest'}`);

  // 1. Redirect authenticated users away from landing page
  if (user && pathname === '/') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    const is_admin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || profile?.is_admin;
    const redirectPath = is_admin ? '/admin' : '/feed';

    console.log(`[Middleware] Authenticated user on landing, redirecting to ${redirectPath}`);
    const url = request.nextUrl.clone()
    url.pathname = redirectPath
    const response = NextResponse.redirect(url)
    supabaseResponse.headers.forEach((value, key) => {
      response.headers.append(key, value)
    })
    return response
  }

  // 2. Protect Authenticated Routes
  const protectedRoutes = [
    '/feed',
    '/admin',
    '/projects',
    '/surveys',
    '/gallery',
    '/analytics',
    '/notifications',
    '/settings',
    '/u'
  ];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !user) {
    console.log(`[Middleware] Guest accessing protected route ${pathname}, redirecting to /`);
    const url = request.nextUrl.clone()
    url.pathname = '/'
    const response = NextResponse.redirect(url)
    supabaseResponse.headers.forEach((value, key) => {
      response.headers.append(key, value)
    })
    return response
  }

  // 3. Admin-only route protection
  if (pathname.startsWith('/admin')) {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      const is_admin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || profile?.is_admin;

      if (!is_admin) {
        console.log(`[Middleware] Non-admin user ${user.email} accessing /admin, redirecting to /feed`);
        const url = request.nextUrl.clone()
        url.pathname = '/feed'
        const response = NextResponse.redirect(url)
        supabaseResponse.headers.forEach((value, key) => {
          response.headers.append(key, value)
        })
        return response
      }
      console.log(`[Middleware] Admin access granted to ${user.email}`);
    }
  }

  // 4. Prevent Admin from accessing user feed
  if (pathname.startsWith('/feed')) {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      const is_admin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || profile?.is_admin;

      if (is_admin) {
        console.log(`[Middleware] Admin ${user.email} accessing /feed, redirecting to /admin`);
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        const response = NextResponse.redirect(url)
        supabaseResponse.headers.forEach((value, key) => {
          response.headers.append(key, value)
        })
        return response
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

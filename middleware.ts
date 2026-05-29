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

  // Cache profile check to avoid multiple lookups in one request
  let profile: any = null;
  const getCachedProfile = async () => {
    if (!user) return null;
    if (profile) return profile;
    const { data } = await supabase
      .from('profiles')
      .select('is_admin, is_verified_creator, approved')
      .eq('id', user.id)
      .single();
    profile = data;
    return profile;
  };

  const isAdminUser = async () => {
    if (!user) return false;
    const p = await getCachedProfile();
    return user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || p?.is_admin;
  }

  const isVerifiedCreator = async () => {
    if (!user) return false;
    const p = await getCachedProfile();
    return p?.is_verified_creator || p?.approved;
  }

  // 1. Redirect authenticated users away from landing page
  if (user && pathname === '/') {
    const is_admin = await isAdminUser();
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
      const is_admin = await isAdminUser();

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

  // 4. Creator-only route protection
  if (pathname.startsWith('/creator')) {
    if (user) {
      const is_creator = await isVerifiedCreator();
      const is_admin = await isAdminUser();

      if (!is_creator && !is_admin) {
        console.log(`[Middleware] Non-creator user ${user.email} accessing /creator, redirecting to /feed`);
        const url = request.nextUrl.clone()
        url.pathname = '/feed'
        const response = NextResponse.redirect(url)
        supabaseResponse.headers.forEach((value, key) => {
          response.headers.append(key, value)
        })
        return response
      }
      console.log(`[Middleware] Creator access granted to ${user.email}`);
    } else {
      console.log(`[Middleware] Guest accessing /creator, redirecting to /`);
      const url = request.nextUrl.clone()
      url.pathname = '/'
      const response = NextResponse.redirect(url)
      supabaseResponse.headers.forEach((value, key) => {
        response.headers.append(key, value)
      })
      return response
    }
  }

  // 5. Prevent Admin from accessing user feed & tools
  const creatorSystemRoutes = ['/feed', '/creators', '/profile'];
  if (creatorSystemRoutes.some(route => pathname.startsWith(route))) {
    if (user) {
      const is_admin = await isAdminUser();

      if (is_admin) {
        console.log(`[Middleware] Admin ${user.email} accessing creator system ${pathname}, redirecting to /admin`);
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

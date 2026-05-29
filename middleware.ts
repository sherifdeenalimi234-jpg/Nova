import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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
  if (userError) console.error('Middleware getUser error:', userError.message)

  // Ensure authenticated users don't get stuck on auth callback or login if already have session
  if (user && request.nextUrl.pathname === '/auth/login') {
    console.log('User already logged in, redirecting to home.');
    const url = request.nextUrl.clone()
    url.pathname = '/'
    const response = NextResponse.redirect(url)
    // IMPORTANT: Transfer all headers including cookies to the new response
    supabaseResponse.headers.forEach((value, key) => {
      response.headers.append(key, value)
    })
    return response
  }

  // Admin protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('Checking admin access for:', user?.email);
    if (!user) {
      console.log('No user session, redirecting to home.');
      const url = request.nextUrl.clone()
      url.pathname = '/'
      const response = NextResponse.redirect(url)
      supabaseResponse.headers.forEach((value, key) => {
        response.headers.append(key, value)
      })
      return response
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      console.error('Admin verification failed:', profileError?.message || 'Not an admin');
      const url = request.nextUrl.clone()
      url.pathname = '/'
      const response = NextResponse.redirect(url)
      supabaseResponse.headers.forEach((value, key) => {
        response.headers.append(key, value)
      })
      return response
    }
    console.log('Admin access granted.');
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

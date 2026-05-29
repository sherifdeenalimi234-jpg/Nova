import { NextResponse } from 'next/server'
// The client you created in Step 3
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && session?.user) {
      const user = session.user
      const adminEmail = 'sherifdeenalimititilope@gmail.com'

      // Automatically assign admin and creator privileges to the specified email
      if (user.email === adminEmail) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            is_admin: true,
            is_verified_creator: true,
            full_name: user.user_metadata.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata.avatar_url,
            updated_at: new Date().toISOString()
          })
      }

      // Explicitly redirect admin to mission control
      let redirectUrl = next
      if (user.email === adminEmail) {
        redirectUrl = '/admin'
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectUrl}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

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
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback exchange error:', error.message);
      return NextResponse.redirect(new URL(`/auth/auth-code-error?error=${encodeURIComponent(error.message)}`, request.url))
    }

    if (data?.user) {
      const user = data.user
      const adminEmail = 'sherifdeenalimititilope@gmail.com'

      console.log('User authenticated:', user.email);

      // Automatically assign admin and creator privileges to the specified email
      if (user.email?.toLowerCase() === adminEmail.toLowerCase()) {
        console.log('Admin user detected, updating profile...');
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            is_admin: true,
            is_verified_creator: true,
            full_name: user.user_metadata.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata.avatar_url,
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('Failed to update admin privileges:', profileError.message)
        }
      } else {
        // Ensure standard profile exists
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: user.user_metadata.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata.avatar_url,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
      }

      // Explicitly redirect admin to mission control
      let redirectUrl = next
      if (user.email?.toLowerCase() === adminEmail.toLowerCase()) {
        redirectUrl = '/admin'
      }

      console.log('Redirecting to:', redirectUrl);

      // Use request.nextUrl.origin for safer redirection
      const origin = new URL(request.url).origin;
      return NextResponse.redirect(`${origin}${redirectUrl}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}

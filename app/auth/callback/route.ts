import { NextResponse } from 'next/server'
// The client you created in Step 3
import { createClient } from '@/lib/supabase/server'
import { ADMIN_EMAIL, CREATOR_WHITELIST } from '@/lib/constants'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/feed'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback exchange error:', error.message);
      return NextResponse.redirect(new URL(`/auth/auth-code-error?error=${encodeURIComponent(error.message)}`, request.url))
    }

    if (data?.user) {
      const user = data.user

      console.log('User authenticated:', user.email);

      // Explicitly redirect admin to mission control
      let redirectUrl = next
      const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      // Automatically assign admin privileges ONLY to the specified email
      if (isAdmin) {
        console.log('Admin user detected, updating profile...');
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            is_admin: true,
            // Admin should NOT have creator privileges automatically
            full_name: user.user_metadata.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata.avatar_url,
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('Failed to update admin privileges:', profileError.message)
        }
        redirectUrl = '/admin'
      } else {
        // Check if user is in creator whitelist (hardcoded or database)
        const isHardcodedCreator = user.email && CREATOR_WHITELIST.map(e => e.toLowerCase()).includes(user.email.toLowerCase());

        let isDynamicCreator = false;
        if (user.email) {
          const { data: whitelistEntry } = await supabase
            .from('creator_whitelist')
            .select('email')
            .eq('email', user.email.toLowerCase())
            .maybeSingle();
          isDynamicCreator = !!whitelistEntry;
        }

        const isWhitelistedCreator = isHardcodedCreator || isDynamicCreator;

        const profileData: any = {
          id: user.id,
          full_name: user.user_metadata.full_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata.avatar_url,
          updated_at: new Date().toISOString()
        };

        if (isWhitelistedCreator) {
          console.log(`Whitelisted creator detected: ${user.email}, auto-granting access...`);
          profileData.is_verified_creator = true;
          profileData.creator_verified = true;
          profileData.creator_status = 'approved';
          profileData.verification_status = 'approved';
          profileData.creator_since = profileData.creator_since || new Date().toISOString();
          profileData.payment_status = 'verified';
          profileData.creator_plan = 'premium';
          profileData.role = 'creator';
          profileData.permissions = ['all'];
        }

        // Ensure profile exists
        await supabase
          .from('profiles')
          .upsert(profileData, { onConflict: 'id' });

        // If whitelisted, ensure creator_profiles record exists
        if (isWhitelistedCreator) {
          await supabase
            .from('creator_profiles')
            .upsert({ id: user.id }, { onConflict: 'id' });
        }

        // If "next" was "/" (default from many places), ensure normal users go to /feed
        if (redirectUrl === '/') redirectUrl = '/feed'
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

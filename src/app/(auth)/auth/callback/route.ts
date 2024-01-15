import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import type { Database } from '@/libs/supabase/types';
import { getEnvVar } from '@/utils/get-env-var';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

const siteUrl = getEnvVar(process.env.NEXT_PUBLIC_SITE_URL, 'NEXT_PUBLIC_SITE_URL');

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.redirect(`${siteUrl}/login`);
    }

    // Check if user is subscribed, if not redirect to pricing page
    const { data: userSubscription } = await supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .maybeSingle();

    if (!userSubscription) {
      return NextResponse.redirect(`${siteUrl}/pricing`);
    } else {
      return NextResponse.redirect(`${siteUrl}`);
    }
  }

  return NextResponse.redirect(siteUrl);
}

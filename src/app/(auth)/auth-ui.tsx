'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IoLogoGithub, IoLogoGoogle } from 'react-icons/io5';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useSupabase } from '@/libs/supabase/supabase-provider';
import { getEnvVar } from '@/utils/get-env-var';

const titleMap = {
  login: 'Login to AI Twitter Banner',
  signup: 'Join AI Twitter Banner and start generating banners for free',
} as const;

export function AuthUI({ mode }: { mode: 'login' | 'signup' }) {
  const { supabase } = useSupabase();
  const [pending, setPending] = useState(false);
  const [emailFormOpen, setEmailFormOpen] = useState(false);

  async function signInWithOAuth(provider: 'github' | 'google') {
    setPending(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${getEnvVar(process.env.NEXT_PUBLIC_SITE_URL, 'NEXT_PUBLIC_SITE_URL')}/auth/callback`,
      },
    });
    if (error) {
      toast({
        variant: 'destructive',
        description: 'An error occurred while authenticating. Please try again.',
      });
      console.error(error);
    }
  }

  async function signInWithEmail(email: string) {
    setPending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${getEnvVar(process.env.NEXT_PUBLIC_SITE_URL, 'NEXT_PUBLIC_SITE_URL')}/auth/callback`,
      },
    });
    if (error) {
      toast({
        variant: 'destructive',
        description: 'An error occurred while authenticating. Please try again.',
      });
      console.error(error);
    } else {
      toast({
        description: `To continue, click the link in the email sent to: ${email}`,
      });
    }
  }

  function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = event.target as HTMLFormElement;
    const email = form['email'].value;
    signInWithEmail(email);
    form.reset();
    setPending(false);
  }

  function handleOAuthClick(provider: 'google' | 'github') {
    setPending(true);
    signInWithOAuth(provider);
  }

  return (
    <section className='mt-16 flex w-full flex-col gap-16 rounded-lg bg-black p-10 px-4 text-center'>
      <div className='flex flex-col gap-4'>
        <Image src='/logo.png' width={80} height={80} alt='' className='m-auto' />
        <h1 className='text-lg'>{titleMap[mode]}</h1>
      </div>
      <div className='flex flex-col gap-4'>
        <button
          className='flex items-center justify-center gap-2 rounded-md bg-cyan-500 py-4 font-medium text-black transition-all hover:bg-cyan-400 disabled:bg-neutral-700'
          onClick={() => handleOAuthClick('google')}
          disabled={pending}
        >
          <IoLogoGoogle size={20} />
          Continue with Google
        </button>
        <button
          className='flex items-center justify-center gap-2 rounded-md bg-fuchsia-500 py-4 font-medium text-black transition-all hover:bg-fuchsia-400 disabled:bg-neutral-700'
          onClick={() => handleOAuthClick('github')}
          disabled={pending}
        >
          <IoLogoGithub size={20} />
          Continue with GitHub
        </button>

        <Collapsible open={emailFormOpen} onOpenChange={setEmailFormOpen}>
          <CollapsibleTrigger asChild>
            <button
              className='text-neutral6 flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 py-4 font-medium transition-all hover:bg-zinc-800 disabled:bg-neutral-700 disabled:text-black'
              disabled={pending}
            >
              Continue with Email
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className='mt-[-2px] w-full rounded-b-md bg-zinc-900 p-8'>
              <form onSubmit={handleEmailSubmit}>
                <Input
                  type='email'
                  name='email'
                  placeholder='Enter your email'
                  aria-label='Enter your email'
                  autoFocus
                />
                <div className='mt-4 flex justify-end gap-2'>
                  <Button type='button' onClick={() => setEmailFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant='secondary' type='submit'>
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      {mode === 'signup' && (
        <span className='text-neutral5 m-auto max-w-sm text-sm'>
          By clicking continue, you agree to our{' '}
          <Link href='/terms' className='underline'>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href='/privacy' className='underline'>
            Privacy Policy
          </Link>
          .
        </span>
      )}
    </section>
  );
}

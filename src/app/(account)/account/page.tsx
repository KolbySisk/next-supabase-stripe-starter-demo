import { PropsWithChildren, ReactNode } from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { getSession } from '@/features/account/controllers/get-session';
import { getSubscription } from '@/features/account/controllers/get-subscription';
import { PricingCard } from '@/features/pricing/components/price-card';
import { getProducts } from '@/features/pricing/controllers/get-products';
import { Price, ProductWithPrices } from '@/features/pricing/types';
import { Database } from '@/libs/supabase/types';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';

export default async function AccountPage() {
  const [session, subscription, products] = await Promise.all([getSession(), getSubscription(), getProducts()]);

  if (!session) {
    redirect('/login');
  }

  let userProduct: ProductWithPrices | undefined;
  let userPrice: Price | undefined;

  if (subscription) {
    for (const product of products) {
      for (const price of product.prices) {
        if (price.id === subscription.price_id) {
          userProduct = product;
          userPrice = price;
        }
      }
    }
  }

  const updateEmail = async (formData: FormData) => {
    'use server';

    const newEmail = formData.get('email') as string;
    const supabase = createServerActionClient<Database>({ cookies });
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      console.error(error);
    }
    toast({
      description: `Verify your email by clicking the link in the email sent to: ${newEmail}`,
    });
  };

  return (
    <section className='rounded-lg bg-black px-4 py-16'>
      <h1 className='mb-8 text-center'>Account</h1>

      <div className='flex flex-col gap-4'>
        <Card
          title='Your Plan'
          footer={
            subscription ? (
              <Button size='sm' variant='secondary' asChild>
                <Link href='/manage-subscription'>Manage your subscription</Link>
              </Button>
            ) : (
              <Button size='sm' variant='secondary' asChild>
                <Link href='/pricing'>Start a subscription</Link>
              </Button>
            )
          }
        >
          {userProduct && userPrice ? (
            <PricingCard product={userProduct} price={userPrice} />
          ) : (
            <p>You don&apos;t have an active subscription</p>
          )}
        </Card>

        <Card
          title='Your Email'
          footer={
            <Button size='sm' variant='secondary' type='submit' form='emailForm'>
              Update Email
            </Button>
          }
        >
          <form id='emailForm' action={updateEmail}>
            <Input
              type='text'
              name='email'
              className='m-auto w-full rounded-md lg:w-1/2'
              defaultValue={session.user.email}
              placeholder='Your email'
              maxLength={64}
            />
          </form>
        </Card>
      </div>
    </section>
  );
}

function Card({
  title,
  footer,
  children,
}: PropsWithChildren<{
  title: string;
  footer?: ReactNode;
}>) {
  return (
    <div className='m-auto w-full max-w-3xl rounded-md bg-zinc-900'>
      <div className='p-4'>
        <h2 className='mb-1 text-xl font-semibold'>{title}</h2>
        <div className='py-4'>{children}</div>
      </div>
      <div className='flex justify-end rounded-b-md border-t border-zinc-800 p-4'>{footer}</div>
    </div>
  );
}

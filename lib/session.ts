'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './auth';
import { cache } from 'react';

export const getUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    redirect('/login');
  }

  return session.user;
});

'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './auth';

export async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    redirect('/login');
  }

  return session.user;
}

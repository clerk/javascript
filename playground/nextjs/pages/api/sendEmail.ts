import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth, clerkClient } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = await getAuth(req);
  if (!userId) return res.status(401);

  const user = await clerkClient.users.getUser(userId);
  const email = user.primaryEmailAddressId;

  if (!email) return res.status(422).json({ error: 'primaryEmailAddress is required!' });

  const params = {
    fromEmailName: 'foobar123',
    emailAddressId: email,
    body: 'this is a test',
    subject: 'this is a test',
  };
  const response = await clerkClient.emails.createEmail(params);
  console.log(response);
  return res.status(200).json({ name: 'John Doe' });
}

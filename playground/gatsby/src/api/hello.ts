import { clerkClient, withAuth } from '@clerk/clerk-sdk-node';

interface ContactBody {
  message: string;
}

const handler = withAuth(async (req, res) => {
  const users = await clerkClient.users.getUserList();
  res.send({ title: `We have ${users.length} users`, message: req.body.message, auth: req.auth });
});

export default handler;

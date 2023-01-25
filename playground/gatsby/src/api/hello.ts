import { clerkClient, withAuth } from 'gatsby-plugin-clerk/server';

interface ContactBody {
  message: string;
}

const handler = withAuth(async (req, res) => {
  const users = await clerkClient.users.getUserList();
  res.send({ title: `I am TYPESCRIPT`, message: req.body.message, auth: req.auth });
});

export default handler;

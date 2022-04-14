import { withAuth } from '@clerk/clerk-sdk-node';

function handler(req, res) {
  console.log('Session optional');
  res.statusCode = 200;
  res.json(req.auth);
}

export default withAuth(handler);

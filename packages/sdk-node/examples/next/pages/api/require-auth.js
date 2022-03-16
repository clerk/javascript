import { requireAuth } from '@clerk/clerk-sdk-node';

function handler(req, res) {
  console.log('Session required');
  res.statusCode = 200;
  res.json(req.auth);
}

export default requireAuth(handler);

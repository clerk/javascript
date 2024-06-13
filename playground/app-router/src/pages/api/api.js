import { requireAuth } from "@clerk/nextjs/api";
 
export default requireAuth(async function handler(
  req,
  res
) {
  // Load any data your application needs for the API route
  return res.status(200).json({});
})

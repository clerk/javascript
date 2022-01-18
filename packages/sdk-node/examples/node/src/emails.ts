// Usage:
// From examples/node, transpile files by running `tsc`
// To run:
// node --require dotenv/config dist/emails.js

import { emails,setClerkServerApiUrl } from '@clerk/clerk-sdk-node';

const serverApiUrl = process.env.CLERK_API_URL || '';

setClerkServerApiUrl(serverApiUrl);

console.log('Create email');

const emailAddressId = process.env.EMAIL_ADDRESS_ID || '';
const fromEmailName = 'sales';
const subject = 'Amazing offer!';
const body =
  'Click <a href="https://www.thisiswhyimbroke.com/">here</a> to find out more!';

try {
  let email = await emails.createEmail({
    emailAddressId,
    fromEmailName,
    subject,
    body,
  });

  console.log(email);
} catch (error) {
  console.log(error);
}

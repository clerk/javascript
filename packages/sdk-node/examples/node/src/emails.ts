// Usage:
// From examples/node, run files with "npm test ./src/emails.ts"
import { emails } from '@clerk/clerk-sdk-node';

console.log('Create email');

const emailAddressId = 'idn_23eTZpjqKYgn6qijHVXw0veiOgB';
const fromEmailName = 'sales';
const subject = 'Amazing offer!';
const body =
  'Click <a href="https://www.thisiswhyimbroke.com/">here</a> to find out more!';

try {
  const email = await emails.createEmail({
    emailAddressId,
    fromEmailName,
    subject,
    body,
  });

  console.log(email);
} catch (error) {
  console.log(error);
}

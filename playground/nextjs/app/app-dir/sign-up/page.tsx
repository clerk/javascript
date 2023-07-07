import { SignUp } from '@clerk/nextjs/app-beta';

export default function Page() {
  return <SignUp unsafeMetadata={{ playground: 'nextjs', type: 'app-dir' }} />;
}

import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <SignIn
        routing={'path'}
        path={'/sign-in-or-up'}
        signUpUrl={'/sign-up'}
        fallback={<>Loading sign in</>}
        unsafeMetadata={{ position: 'goalie' }}
        withSignUp
      />
    </div>
  );
}

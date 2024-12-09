import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div>
      <SignIn
        routing={'path'}
        path={'/sign-in'}
        signUpUrl={'/sign-up'}
        __experimental={{
          combinedProps: {},
        }}
      />
    </div>
  );
}

import { SignIn, SignInFactorOne, SignInFactorTwo, SignInSSOCallback, SignInStart } from '@clerk/elements'

export default function SignInPage() {
  return (
    <SignIn>
      <SignInStart>
        Start child
      </SignInStart>
      <SignInFactorOne>
        Factor one child
      </SignInFactorOne>
      <SignInFactorTwo>
        Factor two child
      </SignInFactorTwo>
      <SignInSSOCallback />
    </SignIn>
  )
}

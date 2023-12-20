'use client'
import { SignIn, SignInFactorOne, SignInFactorTwo, SignInSSOCallback, SignInStart, useNextRouter } from '@clerk/elements'

export default function SignInPage() {
  const router = useNextRouter()

  return (
    <SignIn router={router}>
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

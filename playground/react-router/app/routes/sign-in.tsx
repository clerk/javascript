import { SignIn } from '@clerk/react-router'

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center py-8 px-4 flex-col gap-8">
      <h1>Sign In route</h1>
      <SignIn />
    </div>
  )
}
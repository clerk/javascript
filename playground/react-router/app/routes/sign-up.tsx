import { SignUp } from '@clerk/react-router'

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center py-8 px-4 flex-col gap-8">
      <h1>Sign Up route</h1>
      <SignUp />
    </div>
  )
}
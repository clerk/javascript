import { SignIn } from '@clerk/tanstack-start'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-in')({
  component: Page,
})

function Page() {
  return <SignIn />
}

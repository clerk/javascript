import { useUser } from '@clerk/react-router'

export default function UseUserPage() {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) {
    return <p>Loading...</p>
  }

  if (!isSignedIn) {
    return <div>Signed out state</div>
  }

  return <div>Hello, {user.firstName}!</div>
}
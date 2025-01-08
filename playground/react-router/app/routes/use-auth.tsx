import { useAuth } from "@clerk/react-router";

export default function UseAuthPage() {
  const { isLoaded, userId } = useAuth()

  if (!isLoaded) {
    return <p>Loading...</p>
  }

  if (!userId) {
    return <div>Signed out state</div>
  }

  return <div>Hello, {userId}!</div>
}
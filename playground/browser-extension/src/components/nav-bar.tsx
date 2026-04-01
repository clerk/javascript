import { Show, UserButton } from "@clerk/chrome-extension"
import { Link } from "react-router-dom"
import { Button } from "./ui/button"

export const NavBar = () => {
  return (
    <>
      <Show when="signed-in">
        <div className="plasmo-flex plasmo-flex-row plasmo-w-full plasmo-items-center plasmo-bg-gray-800 plasmo-border-t plasmo-border-t-gray-600 plasmo-py-2">
          <Button variant="link" asChild>
            <Link to="/" className="plasmo-mx-2">Home</Link>
          </Button>
          <Button variant="link" asChild className="plasmo-mx-2">
            <Link to="/sdk-features">SDK Features</Link>
          </Button>
          <div className="plasmo-grow plasmo-items-center plasmo-justify-end plasmo-flex plasmo-pr-2">
            <Button variant="link" asChild className="plasmo-mx-2">
              <Link to="/settings">Settings</Link>
            </Button>
            <UserButton />
          </div>
        </div>
      </Show>
      <Show when="signed-out">
        <div className="plasmo-flex plasmo-flex-row plasmo-w-full plasmo-items-center plasmo-bg-gray-800 plasmo-border-t plasmo-border-t-gray-600 plasmo-py-2">
          <Button variant="link" asChild>
            <Link to="/">Home</Link>
          </Button>
          <div className="plasmo-grow plasmo-items-center plasmo-justify-end plasmo-flex plasmo-pr-2">

            <Button variant="link" asChild className="plasmo-mx-2">
              <Link to="/sign-in">Sign In</Link>
            </Button>
            <Button variant="link" asChild className="plasmo-mx-2">

              <Link to="/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </Show>

    </>
  )
}

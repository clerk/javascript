import { Button } from "~components/ui/button"

export const SDKFeatures = () => {
  return (
    <div className="plasmo-px-12 plasmo-pt-6 plasmo-pb-4">
      <h1 className="plasmo-text-2xl plasmo-mb-6">Background Service Worker Support</h1>
      <p className="plasmo-text-lg plasmo-py-2">The @clerk/chrome-extension v2.0 SDK now includes support for interacting with Clerk through a Background Service Worker.</p>
      <p className="plasmo-text-lg plasmo-py-2">v2.0 of the SDK introduces the new `createClerkClient()` helper function. This will also the Background Service Worker to initialize a new Clerk instance and attempt to refresh the user's session.</p>
      <p className="plasmo-text-lg plasmo-py-2">Once done, you can then get a token or interact with many of Clerk's <a className="plasmo-underline plasmo-cursor-pointer" onClick={() => chrome.tabs.create({ url: "https://clerk.com/docs/references/javascript/overview" })}>Javascript</a> functonality.</p>
      <p className="plasmo-text-lg plasmo-py-2">The button below will open a new tab and use a content script to send a message to a Background Servie Worker. Since you are signed in, you will end up seeing your session token displayed.</p>
      <Button
        variant="default"
        className="plasmo-mt-4 plasmo-text-xl"
        onClick={() => {
          chrome.tabs.create({
            url: "./tabs/background-worker-demo.html"
          })
        }}>
        Open Demo Tab
      </Button>

    </div>
  )
}

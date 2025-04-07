import heroIamge from "data-base64:~assets/light-logo.png"

export const Home = () => {
  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-h-full plasmo-bg-black plasmo-text-white">
      <img className="plasmo-h-auto plasmo-mb-8" src={heroIamge} alt="Clerk Chrome Extension SDK 2.0" />
      <h1 className="plasmo-text-2xl plasmo-font-semibold">Clerk Chrome Extension Demo</h1>
      <p className="plasmo-text-[16px] plasmo-mx-20 plasmo-my-4">
        Sign in with the popup or sync your auth state with <a className="plasmo-underline" href="http://localhost:5173">http://localhost:5173</a>, explore an extension built with React Router for tabs and get a token from a tab-based content script using the new <a className="plasmo-underline" href="https://clerk.com/docs/references/chrome-extension/create-clerk-client">createClerkClient()</a> function just for service workers.
      </p>
    </div>
  );
};

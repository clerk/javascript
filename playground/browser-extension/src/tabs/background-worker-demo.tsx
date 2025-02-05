import * as React from 'react';

import "../style.css";
import { Button } from '~components/ui/button';

export default function NewTab() {
  const [token, setToken] = React.useState<string | null>(null);

  const getToken = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    console.log('[Content Script]: Sending request to bakcground service worker');
    // send a message to the background service worker
    chrome.runtime.sendMessage('test', response => {
      console.log('[Content Script]:', JSON.stringify(response));
      setToken(response.token);
    });
  };

  return (
    <div className="plasmo-bg-black plasmo-text-white plasmo-h-svh plasmo-flex plasmo-items-center plasmo-justify-center">
      <div className="plasmo-max-w-screen-lg">
        <h1 className="plasmo-text-3xl plasmo-mb-4">Clerk Background Service Worker demo</h1>
        <div className="App">
          <p className="plasmo-text-lg plasmo-py-2">This new tab simluates a content page where you might want to access user information, or make a request to your backend server and include a user token in the request.</p>
          <p className="plasmo-text-lg plasmo-py-2">Make sure that you are signed into the extension. You can have the popup closed.</p>
          <Button variant='default' className="plasmo-text-lg plasmo-mt-4"
            type='button'
            onClick={getToken}
          >
            Get Token
          </Button>
          <p className="plasmo-mt-8 plasmo-mb-4 plasmo-text-lg">Token:</p>
          <div className="plasmo-border plasmo-border-white/50 w-full plasmo-break-all plasmo-h-52 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-p-4">
            {token && <p>{token}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}




import * as React from 'react';

export default function NewTab() {
  const [token, setToken] = React.useState<string | null>(null);

  const getToken = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // send a message to the background service worker
    chrome.runtime.sendMessage({ greeting: 'get-token' }, response => {
      console.log('MESSAGE RESPONSE', JSON.stringify(response));
      setToken(response.token);
    });
  };

  return (
    <div>
      <p>Clerk Background Worker demo</p>
      <div className="App">
        <p>This new tab simluates a content page where you might want to access user information, or make a request to your backend server and include a user token in the request.</p>
        <p>Make sure that you are signed into the extension. You can have the popup closed.</p>
        <button
          type='button'
          onClick={getToken}
          className='button invert'
        >
          Get Token (Service Worker)
        </button>
        {token && <p>Token: {token}</p>}
      </div>

    </div>
  )
}




import React from 'react';

export function ClerkHeader(type: string) {
  return (
    <header className="App-header">
      <h1>Welcome to the Clerk Chrome Extension Starter ({type})!</h1>
      <a
        className="App-link"
        href="https://clerk.dev/docs"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn more about Clerk
      </a>
    </header>
  );
}

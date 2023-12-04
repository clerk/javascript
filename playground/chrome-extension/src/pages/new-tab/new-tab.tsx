import React from 'react';
import { Routes, Route } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
} from "@clerk/chrome-extension";

import "@assets/styles/index.css"

import { Layout } from '@components/Layout';
import { CurrentUser } from '@components/CurrentUser';

function NewTab() {
  return (
    <Layout syncSessionWithTab>
      <div className="App">
        <header className="App-header">
          <h1>Welcome to the Clerk Chrome Extension Starter!</h1>
          <a
            className="App-link"
            href="https://clerk.dev/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more about Clerk
          </a>
        </header>
        <main className="App-main">
          <Routes>
            <Route path="/sign-up/*" element={<SignUp signInUrl="/" />} />
            <Route
              path="/"
              element={
                <>
                  <SignedIn>
                    <CurrentUser />
                  </SignedIn>
                  <SignedOut>
                    <SignIn afterSignInUrl="/" signUpUrl="/sign-up" />
                  </SignedOut>
                </>
              }
            />
          </Routes>
        </main>
      </div>
    </Layout>
  );
}

export default NewTab;

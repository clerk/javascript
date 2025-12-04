import logo from './logo.svg';
import './App.css';
import { ClerkProvider, SignIn } from '@clerk/react';

function App() {
  return (
    <ClerkProvider frontendApi={'clerk.normal.mammoth-76.lcl.dev'}>
      <div className='App'>
        <header className='App-header'>
          <img
            src={logo}
            className='App-logo'
            alt='logo'
          />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <SignIn />
        </header>
      </div>
    </ClerkProvider>
  );
}

export default App;

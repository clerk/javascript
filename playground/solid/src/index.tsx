/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-solid';
const root = document.getElementById('root');

const pkKey = import.meta.env['VITE_CLERK_PUBLISHABLE_KEY'] as string;

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
  );
}

render(
  () => (
    <ClerkProvider publishableKey={pkKey}>
      <App />,
    </ClerkProvider>
  ),
  root!,
);

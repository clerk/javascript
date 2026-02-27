import { ClerkProvider } from '@clerk/nextjs';

export default function App() {
  return (
    <ClerkProvider>
      <div>Hello</div>
    </ClerkProvider>
  );
}

import { dark } from '@clerk/themes';
import { ClerkProvider } from '@clerk/nextjs';

export default function App() {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <div>Hello</div>
    </ClerkProvider>
  );
}

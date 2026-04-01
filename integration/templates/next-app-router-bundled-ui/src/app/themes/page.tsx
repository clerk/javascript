'use client';

import { SignIn } from '@clerk/nextjs';
import { dark, neobrutalism, shadesOfPurple, shadcn } from '@clerk/ui/themes';

export default function ThemesPage() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem' }}>
      <div>
        <h2>Dark</h2>
        <SignIn
          appearance={{ baseTheme: dark }}
          routing='hash'
          fallback={<>Loading dark theme</>}
        />
      </div>
      <div>
        <h2>Neobrutalism</h2>
        <SignIn
          appearance={{ baseTheme: neobrutalism }}
          routing='hash'
          fallback={<>Loading neobrutalism theme</>}
        />
      </div>
      <div>
        <h2>Shades of Purple</h2>
        <SignIn
          appearance={{ baseTheme: shadesOfPurple }}
          routing='hash'
          fallback={<>Loading shadesOfPurple theme</>}
        />
      </div>
      <div>
        <h2>Shadcn</h2>
        <SignIn
          appearance={{ baseTheme: shadcn }}
          routing='hash'
          fallback={<>Loading shadcn theme</>}
        />
      </div>
    </div>
  );
}

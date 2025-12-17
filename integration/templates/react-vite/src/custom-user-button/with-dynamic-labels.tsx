import { UserButton } from '@clerk/react';
import { PageContextProvider } from '../PageContext.tsx';
import React from 'react';

export default function Page() {
  const [open, setIsOpen] = React.useState(false);
  const [theme, setTheme] = React.useState('light');
  const [notifications, setNotifications] = React.useState(false);
  const [language, setLanguage] = React.useState('en');

  return (
    <PageContextProvider>
      <UserButton fallback={<>Loading user button</>}>
        <UserButton.MenuItems>
          <UserButton.Action
            label={`Chat is ${open ? 'ON' : 'OFF'}`}
            labelIcon={<span>🌐</span>}
            onClick={() => setIsOpen(!open)}
          />
          <UserButton.Action
            label={`Theme: ${theme === 'light' ? '☀️ Light' : '🌙 Dark'}`}
            labelIcon={<span>🌐</span>}
            onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
          />
          <UserButton.Action
            label={`Notifications ${notifications ? '🔔 ON' : '🔕 OFF'}`}
            labelIcon={<span>🌐</span>}
            onClick={() => setNotifications(n => !n)}
          />
          <UserButton.Action
            label={`Language: ${language.toUpperCase()}`}
            labelIcon={<span>🌍</span>}
            onClick={() => setLanguage(l => (l === 'en' ? 'es' : 'en'))}
          />
          <UserButton.Action label={'manageAccount'} />
          <UserButton.Action label={'signOut'} />
          <UserButton.Link
            href={'http://clerk.com'}
            label={'Visit Clerk'}
            labelIcon={<span>🌐</span>}
          />

          <UserButton.Link
            href={'/user'}
            label={'Visit User page'}
            labelIcon={<span>🌐</span>}
          />

          <UserButton.Action
            label={'Custom Alert'}
            labelIcon={<span>🔔</span>}
            onClick={() => alert('custom-alert')}
          />
        </UserButton.MenuItems>
      </UserButton>
    </PageContextProvider>
  );
}

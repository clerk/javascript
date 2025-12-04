import { UserButton } from '@clerk/react';
import { PageContextProvider } from '../PageContext.tsx';
import { useState } from 'react';

export default function Page() {
  const [showDynamicItem, setShowDynamicItem] = useState(false);

  return (
    <PageContextProvider>
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Action
            label='Toggle menu items'
            labelIcon={'🔔'}
            onClick={() => setShowDynamicItem(prev => !prev)}
          />
          {showDynamicItem ? (
            <UserButton.Action
              label='Dynamic action'
              labelIcon={'🌍'}
              onClick={() => {}}
            />
          ) : null}
          {showDynamicItem ? (
            <UserButton.Link
              href={'/user'}
              label='Dynamic link'
              labelIcon={'🌐'}
            />
          ) : null}
        </UserButton.MenuItems>
      </UserButton>
    </PageContextProvider>
  );
}

import { UserButton } from '@clerk/clerk-react';
import { PageContextProvider } from '../PageContext.tsx';
import React from 'react';

export default function Page() {
  const [showDynamicItem, setShowDynamicItem] = React.useState(false);

  return (
    <PageContextProvider>
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Action
            label='Custom action'
            labelIcon={<span>🌐</span>}
            onClick={() => {}}
          />
          {showDynamicItem && (
            <>
              <UserButton.Action
                label='Dynamic action'
                labelIcon={<span>🌍</span>}
                onClick={() => {}}
              />
              <UserButton.Link
                href={'/user'}
                label='Dynamic link'
                labelIcon={<span>🌐</span>}
              />
            </>
          )}
        </UserButton.MenuItems>
      </UserButton>
      <button onClick={() => setShowDynamicItem(prev => !prev)}>Show dynamic items</button>
    </PageContextProvider>
  );
}

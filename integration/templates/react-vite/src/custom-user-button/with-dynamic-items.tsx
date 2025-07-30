import { UserButton } from '@clerk/clerk-react';
import { PageContextProvider } from '../PageContext.tsx';
import React, { Fragment } from 'react';

export default function Page() {
  const [showDynamicItem, setShowDynamicItem] = React.useState(false);

  return (
    <PageContextProvider>
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Action
            label='Show dynamic items'
            labelIcon={<span>🌐</span>}
            onClick={() => setShowDynamicItem(prev => !prev)}
          />
          {showDynamicItem ? (
            <UserButton.Action
              label='Dynamic action'
              labelIcon={<span>🌍</span>}
              onClick={() => {}}
            />
          ) : null}
          {showDynamicItem ? (
            <UserButton.Link
              href={'/user'}
              label='Dynamic link'
              labelIcon={<span>🌐</span>}
            />
          ) : null}
        </UserButton.MenuItems>
      </UserButton>
    </PageContextProvider>
  );
}

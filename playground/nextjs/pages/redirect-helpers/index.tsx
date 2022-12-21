import type { NextPage } from 'next';
import React, { useState } from 'react';
import * as allExports from '@clerk/nextjs';

const UserProfilePage: NextPage = () => {
  const controlComponents = Object.fromEntries(Object.entries(allExports).filter(e => e[0].startsWith('RedirectTo')));

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}
    >
      {Object.entries(controlComponents).map(entry => {
        return (
          <RenderRedirectToggle
            key={entry[0]}
            name={entry[0]}
            Component={entry[1]}
          />
        );
      })}
    </div>
  );
};

const RenderRedirectToggle = (props: any) => {
  const [open, setOpen] = useState(false);
  const { name, Component } = props;

  return (
    <div>
      <button onClick={() => setOpen(true)}>Render redirect: {props.name}</button>
      {open && <Component />}
    </div>
  );
};

export default UserProfilePage;

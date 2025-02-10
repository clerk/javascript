'use client';

import { useEffect } from 'react';

export default () => {
  console.log('cient/page');
  useEffect(() => {
    console.log('cient/page side only component');
  });

  return <div>this is a client components</div>;
};

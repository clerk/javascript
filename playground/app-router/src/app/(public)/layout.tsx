'use client';
import { GoogleOneTap, OrganizationSwitcher, UserButton } from '@clerk/nextjs';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UserButton />
      {/*<OrganizationSwitcher*/}
      {/*  __experimental_hideTrigger*/}
      {/*  __experimental_onActionEnded={() => console.log('wowwow')}*/}
      {/*/>*/}
      {/*<OrganizationSwitcher />*/}
      <GoogleOneTap />
      {children}
    </>
  );
}

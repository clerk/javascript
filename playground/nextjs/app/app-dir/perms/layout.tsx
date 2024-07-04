import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { PropsWithChildren } from 'react';

export default function OrganizationLayout(props: PropsWithChildren) {
  console.log('Props', props);
  // const { orgPermissions, orgRole } = auth()//.protect({role:'member'});
  return (
    <>
      <OrganizationSwitcher />
      <UserButton />
      {/* {orgRole} <br/>
      {orgPermissions?.join(', ')} */}
      {props.children}
    </>
  );
}

'use client';
import { logUserIdActionStack } from '@/app/protect-action/actions';
import { PageComponent } from '@/app/protect-action/page-component';

function Page() {
  // @ts-ignore
  return <PageComponent action={logUserIdActionStack} />;
}

export default Page;

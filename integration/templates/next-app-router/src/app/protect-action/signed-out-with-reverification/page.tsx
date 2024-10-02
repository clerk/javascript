'use client';
import { logUserIdActionReverification } from '@/app/protect-action/actions';
import { PageComponent } from '@/app/protect-action/page-component';

function Page() {
  return <PageComponent action={logUserIdActionReverification} />;
}

export default Page;

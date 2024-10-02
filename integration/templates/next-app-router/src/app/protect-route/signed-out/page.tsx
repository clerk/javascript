'use client';
import { PageComponent } from '@/app/protect-route/page-component';

function Page() {
  return <PageComponent url={'/api/log-user-id'} />;
}

export default Page;

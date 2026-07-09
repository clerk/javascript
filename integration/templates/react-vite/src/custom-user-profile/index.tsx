import { UserProfile } from '@clerk/react';
import { useContext, useState } from 'react';
import { PageContext, PageContextProvider } from '../PageContext.tsx';

function Page1() {
  const { counter, setCounter } = useContext(PageContext);
  // Local state lives INSIDE the portaled custom page. It only resets if the
  // page is remounted, so it is our instrument for detecting remounts.
  const [localCounter, setLocalCounter] = useState(0);

  return (
    <>
      <h1 data-page={1}>Page 1</h1>
      <p data-page={1}>Counter: {counter}</p>
      <button
        data-page={1}
        onClick={() => setCounter(a => a + 1)}
      >
        Update
      </button>
      <p data-local-counter={1}>Local counter: {localCounter}</p>
      <button
        data-local-counter={1}
        onClick={() => setLocalCounter(a => a + 1)}
      >
        Increment local
      </button>
    </>
  );
}

export default function Page() {
  // Bumping parent state recreates the <UserProfile> element, forcing the
  // profile component (and useCustomPages) to rerender. The custom page content
  // must survive this without remounting.
  const [parentTick, setParentTick] = useState(0);

  return (
    <PageContextProvider>
      <button
        data-testid='rerender-parent'
        onClick={() => setParentTick(t => t + 1)}
      >
        Rerender parent: {parentTick}
      </button>
      <UserProfile
        fallback={<>Loading user profile</>}
        path={'/custom-user-profile'}
      >
        <UserProfile.Page
          label={'Page 1'}
          labelIcon={<p data-label-icon={'page-1'}>🙃</p>}
          url='page-1'
        >
          <Page1 />
        </UserProfile.Page>
        <UserProfile.Page label={'security'} />
        <UserProfile.Page
          label={'Page 2'}
          labelIcon={<p data-label-icon={'page-2'}>🙃</p>}
          url='page-2'
        >
          <h1>Page 2</h1>
        </UserProfile.Page>
        <p data-leaked-child>This is leaking</p>
        <UserProfile.Link
          url={'https://clerk.com'}
          label={'Visit Clerk'}
          labelIcon={<p data-label-icon={'page-3'}>🌐</p>}
        />
        <UserProfile.Link
          url={'/user'}
          label={'Visit User page'}
          labelIcon={<p data-label-icon={'page-4'}>🌐</p>}
        />
      </UserProfile>
    </PageContextProvider>
  );
}

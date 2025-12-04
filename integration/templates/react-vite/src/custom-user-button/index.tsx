import { UserButton } from '@clerk/react';
import { useContext } from 'react';
import { PageContext, PageContextProvider } from '../PageContext.tsx';

function Page1() {
  const { counter, setCounter } = useContext(PageContext);

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
    </>
  );
}

export default function Page() {
  return (
    <PageContextProvider>
      <UserButton fallback={<>Loading user button</>}>
        <UserButton.UserProfilePage
          label={'Page 1'}
          labelIcon={<p data-label-icon={'page-1'}>🙃</p>}
          url='page-1'
        >
          <Page1 />
        </UserButton.UserProfilePage>
        <UserButton.UserProfilePage label={'security'} />
        <UserButton.UserProfilePage
          label={'Page 2'}
          labelIcon={<p data-label-icon={'page-2'}>🙃</p>}
          url='page-2'
        >
          <h1>Page 2</h1>
        </UserButton.UserProfilePage>
        <p data-leaked-child>This is leaking</p>
        <UserButton.UserProfileLink
          url={'https://clerk.com'}
          label={'Visit Clerk'}
          labelIcon={<p data-label-icon={'page-3'}>🌐</p>}
        />
        <UserButton.MenuItems>
          <UserButton.Action
            label={'page-1'}
            labelIcon={<span>🙃</span>}
            open={'page-1'}
          />
          <UserButton.Action label={'manageAccount'} />
          <UserButton.Action label={'signOut'} />
          <UserButton.Link
            href={'http://clerk.com'}
            label={'Visit Clerk'}
            labelIcon={<span>🌐</span>}
          />

          <UserButton.Link
            href={'/user'}
            label={'Visit User page'}
            labelIcon={<span>🌐</span>}
          />

          <UserButton.Action
            label={'Custom Alert'}
            labelIcon={<span>🔔</span>}
            onClick={() => alert('custom-alert')}
          />
        </UserButton.MenuItems>
        <UserButton.UserProfileLink
          url={'/user'}
          label={'Visit User page'}
          labelIcon={<p data-label-icon={'page-4'}>🌐</p>}
        />
      </UserButton>
    </PageContextProvider>
  );
}

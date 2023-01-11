import type { NextPage } from 'next';
import React from 'react';
import { useUser, withUser, WithUser, WithUserProp } from '@clerk/nextjs';

function GreetingWithHook() {
  // Use the useUser hook to get the Clerk.user object
  // This hook causes a re-render on user changes
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) {
    // You can handle the loading or signed state separately
    return null;
  }

  return <div>Hello, {user.firstName}!</div>;
}

class GreetingClass extends React.Component<WithUserProp> {
  render() {
    return <div>{this.props.user.firstName ? `Hello ${this.props.user.firstName}!` : 'Hello there!'}</div>;
  }
}

export const GreetingClassHOC = withUser(GreetingClass);

type GreetingProps = {
  greeting: string;
};

const GreetingFn = (props: WithUserProp<GreetingProps>) => {
  const { user, greeting } = props;
  return (
    <>
      <h1>{greeting}</h1>
      <div>{user.firstName ? `Hello, ${user.firstName}!` : 'Hello there!'}</div>
    </>
  );
};

export const GreetingFnHOC = withUser(GreetingFn);

class GreetingFaaC extends React.Component {
  render() {
    return <WithUser>{user => <div>{user.firstName ? `Hello, ${user.firstName}!` : 'Hello there!'}</div>}</WithUser>;
  }
}

const UserExamplesPage: NextPage = () => {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}
    >
      <GreetingWithHook />
      <GreetingClassHOC />
      <GreetingFnHOC greeting={'Ciao'} />
      <GreetingFaaC />
    </div>
  );
};

export default UserExamplesPage;

import { NavLink } from 'react-router';

export function Home() {
  return (
    <div>
      <NavLink to='/sign-in'>Sign In</NavLink>
      <NavLink to='/sign-up'>Sign Up</NavLink>
    </div>
  );
}

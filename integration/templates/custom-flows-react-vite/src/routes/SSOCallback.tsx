import { HandleSSOCallback } from '@clerk/react';
import { useNavigate } from 'react-router';

export function SSOCallback() {
  const navigate = useNavigate();

  return (
    <HandleSSOCallback
      navigateToApp={({ decorateUrl }) => {
        const destination = decorateUrl('/protected');
        if (destination.startsWith('http')) {
          window.location.href = destination;
          return;
        }
        navigate(destination);
      }}
      navigateToSignIn={() => navigate('/sign-in')}
      navigateToSignUp={() => navigate('/sign-up')}
    />
  );
}

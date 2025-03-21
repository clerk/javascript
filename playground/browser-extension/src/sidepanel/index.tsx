import '../style.css';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';

// Import the layouts
import { RootLayout } from '../popup/layouts/root-layout';

// Import the components
import { SignInPage } from '../popup/routes/sign-in';
import { SignUpPage } from '../popup/routes/sign-up';
import { Home } from '../popup/routes/home';
import { Settings } from '../popup/routes/settings';
import { SDKFeatures } from '../popup/routes/sdk-features';

// Create the router
// This removes the need for an App.tsx file
const router = createMemoryRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/sign-in', element: <SignInPage /> },
      { path: '/sign-up', element: <SignUpPage /> },
      { path: '/settings', element: <Settings /> },
      { path: '/sdk-features', element: <SDKFeatures /> },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true
  }
});

export default function SidePanelIndex() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}

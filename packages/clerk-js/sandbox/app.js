const app = document.getElementById('app');

const routes = {
  '/': () => {},
  '/sign-in': () => {
    window.Clerk.mountSignIn(app, {});
  },
  '/sign-up': () => {
    window.Clerk.mountSignUp(app, {});
  },
  '/create-organization': () => {
    window.Clerk.mountCreateOrganization(app, {});
  },
  '/user-button': () => {
    window.Clerk.mountUserButton(app, {});
  },
};

function addCurrentRouteIndicator(currentRoute) {
  const link = document.querySelector(`a[href="${currentRoute}"]`);
  link.classList.remove('text-gray-300', 'hover:bg-gray-700', 'hover:text-white');
  link.classList.add('bg-gray-900', 'text-white');
}

(async () => {
  const route = window.location.pathname;
  const renderCurrentRoute = routes[route];
  addCurrentRouteIndicator(route);
  await window.Clerk.load();
  renderCurrentRoute();
})();

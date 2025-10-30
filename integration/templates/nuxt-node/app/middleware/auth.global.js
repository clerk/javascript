export default defineNuxtRouteMiddleware(to => {
  const { userId } = useAuth();

  const isPublicPage = createRouteMatcher(['/sign-in']);
  const isProtectedPage = createRouteMatcher(['/user']);

  // Is authenticated and trying to access a public page
  if (userId.value && isPublicPage(to)) {
    return navigateTo('/user');
  }

  // Is not authenticated and trying to access a protected page
  if (!userId.value && isProtectedPage(to)) {
    return navigateTo('/sign-in');
  }
});

export default defineNuxtRouteMiddleware((to, from) => {
  const { userId } = useAuth();

  const isPublicPage = ['/sign-in'].includes(to.path);
  const isProtectedPage = ['/user'].includes(to.path);

  // Is authenticated and trying to access a public page
  if (userId.value && isPublicPage) {
    return navigateTo('/user');
  }

  // Is not authenticated and trying to access a protected page
  if (!userId.value && isProtectedPage) {
    return navigateTo('/sign-in');
  }
});

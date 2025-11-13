import { useRoute } from 'nuxt/app';
import { computed } from 'vue';

export const usePathnameWithoutSplatRouteParams = () => {
  const route = useRoute();

  // Get the pathname that includes any named or catch all params
  // eg:
  // the filesystem route /user/[id]/profile/[[...rest]]/page.vue
  // could give us the following pathname /user/123/profile/security
  // if the user navigates to the security section of the user profile
  return computed(() => {
    const pathname = route.path || '';
    const pathParts = pathname.split('/').filter(Boolean);

    // In Vue Router/Nuxt, catch-all params are arrays
    // For /user/[id]/profile/[[...rest]]/page.vue useParams will return { id: '123', rest: ['security'] }
    // So catch all params are always arrays
    const catchAllParams = Object.values(route.params || {})
      .filter(v => Array.isArray(v))
      .flat(Infinity) as string[];

    // Remove catch-all segments from the pathname
    // so we end up with the pathname where the components are mounted at
    // eg /user/123/profile/security will return /user/123/profile as the path
    const path = `/${pathParts.slice(0, pathParts.length - catchAllParams.length).join('/')}`;

    return path;
  });
};

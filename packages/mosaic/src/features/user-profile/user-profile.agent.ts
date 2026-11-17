import type { AgentSurface } from '../../agent/create-agent';
import { action } from '../../agent/create-agent';
import { string } from '../../agent/input';

export function userProfileAgent({
  pages,
  activePage,
  onPageChange,
}: {
  pages: readonly string[];
  activePage: string;
  onPageChange: (page: string) => void;
}): AgentSurface {
  return {
    component: 'userProfile',
    label: 'User profile',
    state: () => ({ page: activePage, pages }),
    actions: {
      showPage: action({
        description: "Shows one of the profile's pages, such as security for passwords and sessions.",
        input: { page: string('One of pages') },
        run: ({ page }) => {
          if (!pages.includes(page)) {
            throw new Error(`${page} is not one of pages`);
          }
          onPageChange(page);
        },
      }),
    },
  };
}

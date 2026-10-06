import { redirect } from 'next/navigation';

// Registry eagerly imports story modules (Emotion, createContext) so we can't call
// getSidebarGroups() in a Server Component. Update this path when adding new components.
export default function HomePage() {
  redirect('/components/button');
}

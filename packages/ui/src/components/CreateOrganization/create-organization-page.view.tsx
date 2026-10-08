import { Card } from '@/ui/elements/Card';

export const CreateOrganizationPageView = ({ children }: { children: React.ReactNode }) => (
  <Card.Root sx={t => ({ width: t.sizes.$108 })}>
    <Card.Content
      sx={t => ({
        padding: `${t.space.$4} ${t.space.$5}`,
      })}
    >
      {children}
    </Card.Content>
    <Card.Footer />
  </Card.Root>
);

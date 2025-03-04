import { Flow } from '../customizables';
import { Card, LoadingCardContainer, withCardStateProvider } from '../elements';

export const TaskNavigation = withCardStateProvider(() => {
  return (
    <Flow.Part part='taskNavigation'>
      <TaskNavigationCard />
    </Flow.Part>
  );
});

export const TaskNavigationCard = () => {
  return (
    <Flow.Part part='taskNavigation'>
      <Card.Root>
        <Card.Content>
          <LoadingCardContainer />
        </Card.Content>
        <Card.Footer />
      </Card.Root>
    </Flow.Part>
  );
};

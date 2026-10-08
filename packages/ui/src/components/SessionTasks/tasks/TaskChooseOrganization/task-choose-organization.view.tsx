import { descriptors, Flex, Flow, localizationKeys, Spinner } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { Header } from '@/ui/elements/Header';

import type {
  TaskChooseOrganizationFooterProps,
  TaskChooseOrganizationViewProps,
} from './task-choose-organization.types';
import { TaskChooseOrganizationFlows } from './task-choose-organization-flows';

const LoadingCardContent = () => (
  <Flex
    direction={'row'}
    align={'center'}
    justify={'center'}
    sx={t => ({
      height: '100%',
      minHeight: t.sizes.$100,
    })}
  >
    <Spinner
      size={'lg'}
      colorScheme={'primary'}
      elementDescriptor={descriptors.spinner}
    />
  </Flex>
);

const TaskChooseOrganizationCardFooter = ({ identifier, signOut }: TaskChooseOrganizationFooterProps) => (
  <Card.Footer>
    <Card.Action
      elementId='signOut'
      gap={2}
      justify='center'
      sx={() => ({ width: '100%' })}
    >
      {identifier && (
        <Card.ActionText
          truncate
          localizationKey={localizationKeys('taskChooseOrganization.signOut.actionText', {
            identifier: identifier,
          })}
        />
      )}
      <Card.ActionLink
        sx={() => ({ flexShrink: 0 })}
        onClick={() => void signOut()}
        localizationKey={localizationKeys('taskChooseOrganization.signOut.actionLink')}
      />
    </Card.Action>
  </Card.Footer>
);

const OrganizationCreationDisabledScreen = ({ identifier, signOut }: TaskChooseOrganizationFooterProps) => (
  <Flow.Root flow='taskChooseOrganization'>
    <Flow.Part part='organizationCreationDisabled'>
      <Card.Root>
        <Card.Content>
          <Header.Root showLogo>
            <Header.Title
              localizationKey={localizationKeys('taskChooseOrganization.organizationCreationDisabled.title')}
            />
            <Header.Subtitle
              localizationKey={localizationKeys('taskChooseOrganization.organizationCreationDisabled.subtitle')}
            />
          </Header.Root>
        </Card.Content>
        <TaskChooseOrganizationCardFooter
          identifier={identifier}
          signOut={signOut}
        />
      </Card.Root>
    </Flow.Part>
  </Flow.Root>
);

export const TaskChooseOrganizationView = (props: TaskChooseOrganizationViewProps) => {
  if (props.isOrganizationCreationDisabled) {
    return (
      <OrganizationCreationDisabledScreen
        identifier={props.identifier}
        signOut={props.signOut}
      />
    );
  }

  return (
    <Flow.Root flow='taskChooseOrganization'>
      <Flow.Part part='chooseOrganization'>
        <Card.Root>
          <Card.Content sx={t => ({ padding: `${t.space.$8} ${t.space.$none} ${t.space.$none}`, gap: t.space.$7 })}>
            {props.isLoading ? (
              <LoadingCardContent />
            ) : (
              <TaskChooseOrganizationFlows
                initialFlow={props.initialFlow}
                organizationCreationDefaults={props.organizationCreationDefaults}
              />
            )}
          </Card.Content>
          <TaskChooseOrganizationCardFooter
            identifier={props.identifier}
            signOut={props.signOut}
          />
        </Card.Root>
      </Flow.Part>
    </Flow.Root>
  );
};

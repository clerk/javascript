import type { AgentSurface } from '../../../agent/create-agent';
import { action } from '../../../agent/create-agent';
import type { Field } from '../../../agent/input';
import { optional, string } from '../../../agent/input';
import type { ReadyProfileSectionModel } from './user-profile-profile-section.types';

export function profileSectionAgent(model: ReadyProfileSectionModel): AgentSurface {
  const { firstNameAttribute: first, lastNameAttribute: last, onSubmitName } = model;
  return {
    component: 'profileSection',
    label: 'Profile',
    state: () => ({
      ...(first.enabled && { firstName: model.firstName }),
      ...(last.enabled && { lastName: model.lastName }),
      ...(model.nameManagedBy && { nameManagedBy: model.nameManagedBy.name }),
    }),
    actions: {
      updateName:
        onSubmitName &&
        (first.enabled || last.enabled) &&
        action({
          description: "Changes the user's name. A name left out keeps its current value.",
          input: {
            ...(first.enabled && { firstName: nameField(first, 'The new first name') }),
            ...(last.enabled && { lastName: nameField(last, 'The new last name') }),
          },
          run: ({ firstName, lastName }) =>
            onSubmitName({ firstName: firstName ?? model.firstName, lastName: lastName ?? model.lastName }),
        }),
    },
  };
}

function nameField({ required }: { required: boolean }, description: string): Field<string | undefined> {
  if (!required) {
    return optional(string(description));
  }
  const field = string(description);
  return {
    ...field,
    parse: (value, key) => {
      const name = field.parse(value, key);
      if (name === '') {
        throw new Error(`${key} is required`);
      }
      return name;
    },
  };
}

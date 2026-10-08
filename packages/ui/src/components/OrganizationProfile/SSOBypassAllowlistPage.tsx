import { withCardStateProvider } from '@/ui/elements/contexts';

import {
  useSSOBypassAddMemberFormController,
  useSSOBypassAddMemberScreenController,
  useSSOBypassAllowlistController,
} from './sso-bypass-allowlist.controller';
import { useSSOBypassAddMemberFormModel, useSSOBypassAllowlistModel } from './sso-bypass-allowlist.model';
import type { AddMemberFormProps, AddMemberProps, SSOBypassAllowlistPageProps } from './sso-bypass-allowlist.types';
import {
  SSOBypassAddMemberFormView,
  SSOBypassAddMemberScreenView,
  SSOBypassAllowlistPageView,
  SSOBypassAllowlistRowView,
} from './sso-bypass-allowlist.view';

const SSOBypassAllowlistPageContent = withCardStateProvider(
  ({
    model,
    ...props
  }: SSOBypassAllowlistPageProps & {
    model: ReturnType<typeof useSSOBypassAllowlistModel>;
  }): JSX.Element => {
    const controller = useSSOBypassAllowlistController(model);
    return (
      <SSOBypassAllowlistPageView
        {...props}
        controller={controller}
        AddMemberScreen={AddMemberScreen}
        AllowlistRow={SSOBypassAllowlistRowView}
      />
    );
  },
);

export const SSOBypassAllowlistPage = (props: SSOBypassAllowlistPageProps) => {
  const model = useSSOBypassAllowlistModel();
  if (!model.canRun()) {
    return null;
  }
  return (
    <SSOBypassAllowlistPageContent
      key={model.scopeKey}
      model={model}
      {...props}
    />
  );
};

const AddMemberScreen = (props: AddMemberProps): JSX.Element => {
  const controller = useSSOBypassAddMemberScreenController(props);
  return (
    <SSOBypassAddMemberScreenView
      controller={controller}
      AddMemberForm={AddMemberForm}
    />
  );
};

const AddMemberFormInternal = (props: AddMemberFormProps): JSX.Element => {
  const model = useSSOBypassAddMemberFormModel(props);
  const controller = useSSOBypassAddMemberFormController(model);
  return <SSOBypassAddMemberFormView {...controller} />;
};

const AddMemberForm = withCardStateProvider(AddMemberFormInternal);

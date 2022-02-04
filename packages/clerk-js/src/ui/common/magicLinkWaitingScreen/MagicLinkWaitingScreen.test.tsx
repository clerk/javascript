import { renderJSON } from '@clerk/shared/testUtils';
import React from 'react';

import {
  ExpiredMagicLinkWaitingScreen,
  ExpiredRetryMagicLinkWaitingScreen,
  FailedMagicLinkWaitingScreen,
  MagicLinkWaitingScreen,
  VerifiedMagicLinkWaitingScreen,
  VerifiedSwitchTabMagicLinkWaitingScreen,
} from './MagicLinkWaitingScreen';

describe('<MagicLinkWaitingScreen/>', function () {
  it('renders the <MagicLinkWaitingScreen/> component', function () {
    const tree = renderJSON(
      <MagicLinkWaitingScreen
        header="header"
        icon="shield"
        mainText="main text"
        noticeText="notice text"
        secondaryText="secondary text"
      />
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders the <ExpiredRetryMagicLinkWaitingScreen/> component', function () {
    const tree = renderJSON(<ExpiredRetryMagicLinkWaitingScreen />);
    expect(tree).toMatchSnapshot();
  });

  it('renders the <ExpiredMagicLinkWaitingScreen/> component', function () {
    const tree = renderJSON(<ExpiredMagicLinkWaitingScreen />);
    expect(tree).toMatchSnapshot();
  });

  it('renders the <FailedMagicLinkWaitingScreen/> component', function () {
    const tree = renderJSON(<FailedMagicLinkWaitingScreen />);
    expect(tree).toMatchSnapshot();
  });

  it('renders the <VerifiedSwitchTabMagicLinkWaitingScreen/> component', function () {
    const tree = renderJSON(<VerifiedSwitchTabMagicLinkWaitingScreen />);
    expect(tree).toMatchSnapshot();
  });

  it('renders the <VerifiedMagicLinkWaitingScreen/> component', function () {
    const tree = renderJSON(<VerifiedMagicLinkWaitingScreen />);
    expect(tree).toMatchSnapshot();
  });
});

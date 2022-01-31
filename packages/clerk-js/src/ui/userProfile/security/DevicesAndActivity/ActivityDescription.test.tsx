import { SessionActivity } from '@clerk/types';
import * as React from 'react';
import { render, renderJSON, screen } from '@clerk/shared/testUtils';
import { ActivityDescription } from 'ui/userProfile/security/DevicesAndActivity/ActivityDescription';

const date = new Date('1/1/2021 18:00 GMT+2');

describe('<ActivityDescription/>', () => {
  it('renders the component with activity fully completed', () => {
    const activity = {
      browserName: 'Safari',
      browserVersion: '10',
      city: 'Athens',
      country: 'Greece',
      deviceType: 'Iphone',
      id: '123',
      ipAddress: '123.123.123.123',
      isMobile: false,
    } as SessionActivity;

    render(
      <ActivityDescription
        sessionActivity={activity}
        isCurrentSession={true}
        lastActiveAt={date}
      />
    );

    screen.getByText(/Safari/);
    screen.getByText(/Iphone/);
    screen.getByText(/This device/);

    screen.getByText(/Athens/);
    screen.getByText(/Greece/);
    screen.getByText(/123.123.123.123/);

    const tree = renderJSON(
      <ActivityDescription
        sessionActivity={activity}
        isCurrentSession={true}
        lastActiveAt={date}
      />
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders the component with ip if location is empty', () => {
    const activity = {
      browserName: 'Safari',
      browserVersion: '10',
      deviceType: 'Iphone',
      id: '123',
      ipAddress: '123.123.123.123',
      isMobile: false,
    } as SessionActivity;

    render(
      <ActivityDescription
        sessionActivity={activity}
        isCurrentSession={true}
        lastActiveAt={date}
      />
    );

    screen.getByText(/123.123.123.123/);
    screen.getByText(/This device/);
    const tree = renderJSON(
      <ActivityDescription
        sessionActivity={activity}
        isCurrentSession={true}
        lastActiveAt={date}
      />
    );
    expect(tree).toMatchSnapshot();
  });

  it('renders the component with empty activity', () => {
    const activity = {} as SessionActivity;

    render(
      <ActivityDescription
        sessionActivity={activity}
        isCurrentSession={true}
        lastActiveAt={date}
      />
    );

    screen.getByText(/Web browser/);
    screen.getByText(/Desktop device/);

    const tree = renderJSON(
      <ActivityDescription
        sessionActivity={activity}
        isCurrentSession={true}
        lastActiveAt={date}
      />
    );
    expect(tree).toMatchSnapshot();
  });
});

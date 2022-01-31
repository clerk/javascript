import React from 'react';
import { Tag } from '@clerk/shared/components/tag';
import { titleize } from '@clerk/shared/utils';
import { IdentificationLinkResource } from '@clerk/types';

type ConnectionsProps = {
  linkedResources: IdentificationLinkResource[];
};

/**
 * Linked email resources are of type "oauth_{provider}" currently.
 * TODO: Type EmailIdentificationLinkResource at types/resources
 */
export const Connections = ({ linkedResources }: ConnectionsProps) => {
  return (
    <>
      {linkedResources.map(resource => (
        <div key={resource.id} className='cl-connection-info'>
          Connected to {titleize(resource.type.split('oauth_')[1])}
        </div>
      ))}
    </>
  );
};

export const PrimaryTag = () => (
  <Tag color='primary' className='cl-tag'>
    Primary
  </Tag>
);

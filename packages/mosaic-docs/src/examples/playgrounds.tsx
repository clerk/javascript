import { Button, SubmitButton } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import type { ElementType } from 'react';

export const playgroundComponents: Partial<Record<string, ElementType>> = {
  Button,
  SubmitButton,
  'Card.Root': Card.Root,
  'Card.Header': Card.Header,
  'Card.Media': Card.Media,
  'Card.Title': Card.Title,
  'Card.Description': Card.Description,
  'Card.Banner': Card.Banner,
  'Card.Content': Card.Content,
  'Card.Footer': Card.Footer,
};

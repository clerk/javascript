export function sanitizeResource(resource?: { private_metadata: any } | { privateMetadata: any }) {
  if (resource) {
    // @ts-expect-error
    delete resource['privateMetadata'];
    // @ts-expect-error
    delete resource['private_metadata'];
  }

  return resource;
}

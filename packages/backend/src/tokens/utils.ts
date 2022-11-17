export function toSSRResource(resource?: { private_metadata: any } | { privateMetadata: any }) {
  // Delete sensitive private metadata from resource before rendering in SSR
  if (resource) {
    // @ts-expect-error
    delete resource['privateMetadata'];
    // @ts-expect-error
    delete resource['private_metadata'];
  }

  return resource;
}

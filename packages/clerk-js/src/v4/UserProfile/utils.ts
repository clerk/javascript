type IDable = { id: string };

export const primaryIdentificationFirst = (primaryId: string | null) => (val1: IDable, val2: IDable) => {
  return primaryId === val1.id ? -1 : primaryId === val2.id ? 1 : 0;
};

export const currentSessionFirst = (id: string) => (a: IDable) => a.id === id ? -1 : 1;

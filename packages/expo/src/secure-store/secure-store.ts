import * as SecureStore from 'expo-secure-store';

import type { IStorage } from '../provider/singleton/types';

const CLERK_DEFAULT_CHUNK_SIZE = 1024;

type KeyValuePair = {
  key: string;
  value: string;
};

type Metadata = {
  totalChunks: number;
};

/**
 * Creates a store based on expo-secure-store, that handles the 2048 size limit on values.
 *
 * The store uses a queue to manage multiple save requests and two slots (A and B) to store the key-value pairs.
 * The function alternates between the two slots to save the key-value pairs and splits the value into chunks to save them.
 * The two slots are used to handle corrupted data or incomplete saves.
 * The keys used are the following: key-latest, key-{A/B}-metadata, key-{A/B}-chunk-{i}, key-{A/B}-complete.
 *
 **/
export const createSecureStore = (): IStorage => {
  let queue: KeyValuePair[] = [];
  let isProcessing = false;

  const setItem = async (key: string, value: string): Promise<void> => {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.log(`Clerk: Error setting value on ${key} in SecureStore:`, error);
    }
  };

  const getItem = async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.log(`Clerk: Error getting value from ${key} in SecureStore:`, error);
      return null;
    }
  };

  const set = (key: string, value: string): Promise<void> => {
    queue.push({ key, value });
    return processQueue();
  };

  const processQueue = async (): Promise<void> => {
    if (isProcessing || queue.length === 0) {
      return;
    }

    isProcessing = true;
    const item = queue.pop();
    if (!item) {
      isProcessing = false;
      return;
    }
    queue = [];

    try {
      const latestKey = `${item.key}-latest`;
      const latestSlot = (await getItem(latestKey)) || 'A';
      const targetSlot = latestSlot === 'A' ? 'B' : 'A';

      await performSet(item.key, item.value, targetSlot);
      await setItem(latestKey, targetSlot);
    } catch (err) {
      console.error('Clerk: Save failed:', err);
    } finally {
      isProcessing = false;
      void processQueue();
    }
  };

  const performSet = async (key: string, value: string, slot: string): Promise<void> => {
    const slotKey = `${key}-${slot}`;
    const chunks = splitIntoChunks(value);
    const metadataKey = `${slotKey}-metadata`;

    for (let i = 0; i < chunks.length; i++) {
      const chunkKey = `${slotKey}-chunk-${i}`;
      await setItem(chunkKey, chunks[i]);
    }

    const metadata: Metadata = { totalChunks: chunks.length };
    await setItem(metadataKey, JSON.stringify(metadata));
    await setItem(`${slotKey}-complete`, 'true');
  };

  const get = async (key: string): Promise<string | null> => {
    const latestKey = `${key}-latest`;
    const latestSlot = (await getItem(latestKey)) || 'A';

    const latestValue = await getSlot(`${key}-${latestSlot}`);
    if (latestValue !== null) {
      return latestValue;
    }

    const fallbackSlot = latestSlot === 'A' ? 'B' : 'A';
    return await getSlot(`${key}-${fallbackSlot}`);
  };

  const getSlot = async (slotKey: string): Promise<string | null> => {
    const metadataKey = `${slotKey}-metadata`;
    const isComplete = await getItem(`${slotKey}-complete`);
    if (!isComplete) {
      return null;
    }

    const metadataString = await getItem(metadataKey);
    if (!metadataString) {
      return null;
    }
    const metadata: Metadata = JSON.parse(metadataString);
    if (!metadata) {
      return null;
    }

    const chunks = [];
    for (let i = 0; i < metadata.totalChunks; i++) {
      const chunkKey = `${slotKey}-chunk-${i}`;
      const chunk = await getItem(chunkKey);
      if (!chunk) {
        return null;
      }
      chunks.push(chunk);
    }

    return chunks.join('');
  };

  return {
    set,
    get,
  };
};

const splitIntoChunks = (value: string, chunkSize = CLERK_DEFAULT_CHUNK_SIZE): string[] => {
  const chunks = [];
  for (let i = 0; i < value.length; i += chunkSize) {
    chunks.push(value.substring(i, i + chunkSize));
  }
  return chunks;
};

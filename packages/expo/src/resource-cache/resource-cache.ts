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
 *
 * The keys used are the following:
 * - key-latest -> 'A'/'B'
 * - key-{A/B}-metadata -> Metadata
 * - key-{A/B}-chunk-{i} -> data chunk
 * - key-{A/B}-complete -> 'true'/'false'
 *
 **/
export const createResourceCacheStore = (): IStorage => {
  let queue: KeyValuePair[] = [];
  let isProcessing = false;

  const secureStoreOpts: SecureStore.SecureStoreOptions = {
    /**
     * The data in the keychain item cannot be accessed after a restart until the
     * device has been unlocked once by the user.
     *
     * This may be useful if you need to access the item when the phone is locked.
     */
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  };
  const setItem = (key: string, value: string) => SecureStore.setItemAsync(key, value, secureStoreOpts);
  const getItem = (key: string) => SecureStore.getItemAsync(key, secureStoreOpts);
  const deleteItem = (key: string) => SecureStore.deleteItemAsync(key, secureStoreOpts);

  const set = (key: string, value: string): Promise<void> => {
    queue.push({ key, value });
    void processQueue();
    return Promise.resolve();
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
      isProcessing = false;
    } catch (err) {
      isProcessing = false;
      throw err;
    } finally {
      void processQueue();
    }
  };

  const performSet = async (key: string, value: string, slot: string): Promise<void> => {
    const slotKey = `${key}-${slot}`;
    const chunks = splitIntoChunks(value);
    const metadataKey = `${slotKey}-metadata`;

    // before saving new chunks, mark the slot as incomplete
    await setItem(`${slotKey}-complete`, 'false');

    // save the chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunkKey = `${slotKey}-chunk-${i}`;
      await setItem(chunkKey, chunks[i]);
    }

    // delete any extra chunks from previous saved value
    const oldMetadataString = await getItem(metadataKey);
    if (oldMetadataString) {
      const oldMetadata: Metadata = JSON.parse(oldMetadataString);
      for (let i = chunks.length; i < oldMetadata.totalChunks; i++) {
        const chunkKey = `${slotKey}-chunk-${i}`;
        await deleteItem(chunkKey);
      }
    }

    // save metadata
    const metadata: Metadata = { totalChunks: chunks.length };
    await setItem(metadataKey, JSON.stringify(metadata));

    // mark the slot as complete
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
    if (isComplete !== 'true') {
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
  // Array.from is used to handle unicode characters correctly
  const characters = Array.from(value);

  const chunks: string[] = [];
  for (let i = 0; i < characters.length; i += chunkSize) {
    chunks.push(characters.slice(i, i + chunkSize).join(''));
  }
  return chunks;
};

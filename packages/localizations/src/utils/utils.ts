type Pair = { key: string; value: string | undefined };

// this function accepts an object and returns an array of keys
// the object can have nested objects as values
// the keys returned are in the format of "parentKey.childKey.grandChildKey"
export function getKeys(obj: any): string[] {
  const keys: string[] = [];
  function recurse(obj: any, parentKey: string = '') {
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        recurse(obj[key], `${parentKey}${key}.`);
      } else {
        keys.push(`${parentKey}${key}`);
      }
    }
  }
  recurse(obj);
  return keys;
}

// this function accepts two arrays of strings and returns an array of strings
// the returned array contains the keys that are present only in the first array
// and not in the second array
export function getUniqueKeys(arr1: string[], arr2: string[]): string[] {
  return arr1.filter(key => !arr2.includes(key));
}

// this function accepts two arrays of strings and returns an array of strings
// the returned array contains the keys that are present in both arrays
export function getCommonKeys(arr1: string[], arr2: string[]): string[] {
  return arr1.filter(key => arr2.includes(key));
}

// this function accepts an object and a string which is a key
// it returns the value of the key in the object
// the key is in the format of "parentKey.childKey.grandChildKey"
export function getValue(obj: any, key: string): string {
  return key.split('.').reduce((acc, curr) => acc[curr], obj);
}

// this function accepts an array of key value pairs and returns an object
// the key value pairs are in the format of {key: "parentKey.childKey.grandChildKey", value: "some value"}
// the returned object may have nested objects as values depending on the keys and their structure
// the values are assigned to the last key from the key string
// example: {key: "parentKey.childKey.grandChildKey", value: "some value"} => {parentKey: {childKey: {grandChildKey: "some value"}}}

export function createObject(pairs: Pair[]): any {
  const obj = {};
  pairs.forEach(pair => {
    const keys = pair.key.split('.');
    const lastKey = keys.pop() as string;
    let temp: any = obj;
    keys.forEach(key => {
      if (!temp[key]) {
        temp[key] = {};
      }
      temp = temp[key];
    });
    temp[lastKey] = pair.value;
  });
  return obj;
}

// function that deep merges two objects
// the second object is merged into the first object
// the first object is modified and returned
export function mergeObjects(obj1: any, obj2: any) {
  for (const key in obj2) {
    if (typeof obj2[key] === 'object') {
      if (!obj1[key]) {
        obj1[key] = {};
      }
      mergeObjects(obj1[key], obj2[key]);
    } else {
      obj1[key] = obj2[key];
    }
  }
  return obj1;
}

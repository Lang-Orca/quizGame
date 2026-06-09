const store = new Map<string, string | number | boolean>();

export function createMMKV() {
  return {
    set: (key: string, value: string | number | boolean) => {
      store.set(key, value);
    },
    getString: (key: string) => {
      const value = store.get(key);
      return typeof value === 'string' ? value : undefined;
    },
    getNumber: (key: string) => {
      const value = store.get(key);
      return typeof value === 'number' ? value : undefined;
    },
    getBoolean: (key: string) => {
      const value = store.get(key);
      return typeof value === 'boolean' ? value : undefined;
    },
  };
}

interface Stored {
  username: string;
  password: string;
}

const store = new Map<string, Stored>();

export const ACCESSIBLE = {
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
};

export function setGenericPassword(
  username: string,
  password: string,
  options?: {service?: string},
): Promise<boolean> {
  const service = options?.service ?? 'default';
  store.set(service, {username, password});
  return Promise.resolve(true);
}

export function getGenericPassword(options?: {
  service?: string;
}): Promise<Stored | false> {
  const service = options?.service ?? 'default';
  const value = store.get(service);
  return Promise.resolve(value ?? false);
}

export function resetGenericPassword(options?: {
  service?: string;
}): Promise<boolean> {
  const service = options?.service ?? 'default';
  store.delete(service);
  return Promise.resolve(true);
}

export function __resetKeychain(): void {
  store.clear();
}

export default {
  ACCESSIBLE,
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword,
};

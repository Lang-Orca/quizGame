import {createMMKV} from 'react-native-mmkv';

import {MMKV_KEYS} from './keys';

const mmkv = createMMKV({id: 'quizgame-storage'});

export const storage = {
  set(key: string, value: string | number | boolean): void {
    if (typeof value === 'boolean') {
      mmkv.set(key, value);
      return;
    }
    if (typeof value === 'number') {
      mmkv.set(key, value);
      return;
    }
    mmkv.set(key, value);
  },

  getString(key: string): string | undefined {
    return mmkv.getString(key);
  },

  getNumber(key: string): number | undefined {
    return mmkv.getNumber(key);
  },

  getBoolean(key: string): boolean | undefined {
    return mmkv.getBoolean(key);
  },

  pingInit(): void {
    storage.set(MMKV_KEYS.INIT_TEST, true);
  },

  isInitOk(): boolean {
    return storage.getBoolean(MMKV_KEYS.INIT_TEST) === true;
  },
};

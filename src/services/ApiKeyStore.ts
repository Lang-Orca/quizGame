import * as Keychain from 'react-native-keychain';

import {KEYCHAIN_SERVICE_GEMINI} from '@/constants';

/**
 * Stockage sécurisé de la clé API Gemini via le Keychain/Keystore natif.
 * La clé n'est jamais persistée en clair dans SQLite ou MMKV.
 */
export class ApiKeyStore {
  constructor(private readonly service: string = KEYCHAIN_SERVICE_GEMINI) {}

  async save(apiKey: string): Promise<void> {
    await Keychain.setGenericPassword('gemini', apiKey, {
      service: this.service,
    });
  }

  async get(): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword({
      service: this.service,
    });
    if (!credentials) {
      return null;
    }
    return credentials.password;
  }

  async clear(): Promise<void> {
    await Keychain.resetGenericPassword({service: this.service});
  }

  async hasKey(): Promise<boolean> {
    return (await this.get()) !== null;
  }
}

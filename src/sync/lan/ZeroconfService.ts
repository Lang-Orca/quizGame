import Zeroconf from 'react-native-zeroconf';

import {WS_PORT} from '@/constants';

const SERVICE_TYPE = 'quizgame';
const SERVICE_PROTOCOL = 'tcp';
const SERVICE_DOMAIN = 'local.';

export interface DiscoveredSalon {
  name: string;
  host: string;
  port: number;
  addresses: string[];
  sessionId?: string;
  nom?: string;
  code?: string;
}

interface ZeroconfTxt {
  sessionId?: string;
  nom?: string;
  code?: string;
}

interface ZeroconfResolvedService {
  name: string;
  host: string;
  port: number;
  addresses?: string[];
  txt?: ZeroconfTxt;
}

/**
 * Découverte de salon via NSD/Bonjour (`_quizgame._tcp`).
 * Côté hôte : publish ; côté joueur : scan.
 */
export class ZeroconfService {
  private readonly zeroconf = new Zeroconf();
  private publishedName: string | null = null;

  publish(name: string, txt: ZeroconfTxt, port: number = WS_PORT): void {
    this.publishedName = name;
    this.zeroconf.publishService(
      SERVICE_TYPE,
      SERVICE_PROTOCOL,
      SERVICE_DOMAIN,
      name,
      port,
      txt as Record<string, string>,
    );
  }

  unpublish(): void {
    if (this.publishedName) {
      this.zeroconf.unpublishService(this.publishedName);
      this.publishedName = null;
    }
  }

  startScan(
    onFound: (salon: DiscoveredSalon) => void,
    onError?: (error: unknown) => void,
  ): void {
    this.zeroconf.on('resolved', (service: ZeroconfResolvedService) => {
      const addresses = service.addresses ?? [];
      onFound({
        name: service.name,
        host: service.host,
        port: service.port,
        addresses,
        sessionId: service.txt?.sessionId,
        nom: service.txt?.nom,
        code: service.txt?.code,
      });
    });

    if (onError) {
      this.zeroconf.on('error', onError);
    }

    this.zeroconf.scan(SERVICE_TYPE, SERVICE_PROTOCOL, SERVICE_DOMAIN);
  }

  stopScan(): void {
    this.zeroconf.stop();
    this.zeroconf.removeAllListeners?.();
  }
}

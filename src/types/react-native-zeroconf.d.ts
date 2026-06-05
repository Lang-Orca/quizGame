declare module 'react-native-zeroconf' {
  type ZeroconfListener = (...args: any[]) => void;

  export default class Zeroconf {
    on(event: string, callback: ZeroconfListener): void;
    removeAllListeners?(event?: string): void;
    publishService(
      type: string,
      protocol: string,
      domain: string,
      name: string,
      port: number,
      txt?: Record<string, string>,
    ): void;
    unpublishService(name: string): void;
    scan(type: string, protocol: string, domain: string): void;
    stop(): void;
  }
}

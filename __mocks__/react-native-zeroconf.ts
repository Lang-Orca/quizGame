type Listener = (...args: unknown[]) => void;

export default class Zeroconf {
  private listeners: Record<string, Listener[]> = {};

  on(event: string, cb: Listener): void {
    (this.listeners[event] ??= []).push(cb);
  }

  removeAllListeners(): void {
    this.listeners = {};
  }

  publishService(): void {}

  unpublishService(): void {}

  scan(): void {}

  stop(): void {}
}

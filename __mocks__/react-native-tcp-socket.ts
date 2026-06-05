type Listener = (...args: unknown[]) => void;

class MockSocket {
  peer: MockSocket | null = null;
  private listeners: Record<string, Listener[]> = {};

  on(event: string, cb: Listener): this {
    (this.listeners[event] ??= []).push(cb);
    return this;
  }

  emit(event: string, ...args: unknown[]): void {
    (this.listeners[event] ?? []).forEach(cb => cb(...args));
  }

  write(data: string): boolean {
    if (this.peer) {
      this.peer.emit('data', data);
    }
    return true;
  }

  destroy(): void {
    this.emit('close');
    this.peer?.emit('close');
  }
}

class MockServer {
  private listeners: Record<string, Listener[]> = {};

  constructor(private readonly handler: (socket: MockSocket) => void) {}

  on(event: string, cb: Listener): this {
    (this.listeners[event] ??= []).push(cb);
    return this;
  }

  listen(options: {port: number; host?: string}, cb?: () => void): this {
    registry.set(options.port, this.handler);
    cb?.();
    return this;
  }

  close(): void {}
}

const registry = new Map<number, (socket: MockSocket) => void>();

const TcpSocket = {
  createServer: (handler: (socket: MockSocket) => void) =>
    new MockServer(handler),
  createConnection: (options: {host: string; port: number}, cb?: () => void) => {
    const clientSocket = new MockSocket();
    const handler = registry.get(options.port);
    if (handler) {
      const serverSocket = new MockSocket();
      clientSocket.peer = serverSocket;
      serverSocket.peer = clientSocket;
      handler(serverSocket);
    }
    cb?.();
    return clientSocket;
  },
};

export function resetMockTcp(): void {
  registry.clear();
}

export default TcpSocket;

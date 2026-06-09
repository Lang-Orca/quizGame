import TcpSocket from 'react-native-tcp-socket';

import {WS_PORT} from '@/constants';
import {encodeFrame, FrameDecoder} from '@/sync/messages';
import type {WsMessage} from '@/sync/messages';

/**
 * Client TCP du joueur. Se connecte à l'hôte, décode le flux et envoie un
 * heartbeat PING périodique.
 */
export class WsClient {
  private socket: ReturnType<typeof TcpSocket.createConnection> | null = null;
  private readonly decoder = new FrameDecoder();
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private sessionId = '';

  private messageHandler?: (message: WsMessage) => void;
  private closeHandler?: () => void;

  connect(host: string, port: number = WS_PORT): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = TcpSocket.createConnection({host, port}, () => {
        this.startHeartbeat();
        resolve();
      });

      this.socket.on('data', data => {
        const messages = this.decoder.push(data.toString());
        messages.forEach(message => {
          if (message.type === 'PONG') {
            return;
          }
          this.messageHandler?.(message);
        });
      });

      this.socket.on('error', (error: Error) => {
        this.stopHeartbeat();
        reject(error);
      });

      this.socket.on('close', () => {
        this.stopHeartbeat();
        this.closeHandler?.();
      });
    });
  }

  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  onMessage(handler: (message: WsMessage) => void): void {
    this.messageHandler = handler;
  }

  onClose(handler: () => void): void {
    this.closeHandler = handler;
  }

  send(message: WsMessage): void {
    this.socket?.write(encodeFrame(message));
  }

  disconnect(): void {
    this.stopHeartbeat();
    try {
      this.socket?.destroy();
    } catch {
      // ignore
    }
    this.socket = null;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeat = setInterval(() => {
      this.send({
        type: 'PING',
        payload: {},
        timestamp: Date.now(),
        sessionId: this.sessionId,
      });
    }, 5000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeat !== null) {
      clearInterval(this.heartbeat);
      this.heartbeat = null;
    }
  }
}

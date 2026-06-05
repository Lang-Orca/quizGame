import TcpSocket from 'react-native-tcp-socket';
import {v4 as uuidv4} from 'uuid';

import {WS_PORT} from '@/constants';
import {encodeFrame, FrameDecoder} from '@/sync/messages';
import type {WsMessage} from '@/sync/messages';

interface ConnectedClient {
  socket: ReturnType<typeof TcpSocket.createConnection>;
  decoder: FrameDecoder;
}

/**
 * Serveur TCP de l'hôte. Reçoit les connexions joueurs, décode le flux JSON
 * délimité par '\n' et expose un heartbeat PING/PONG.
 */
export class WsServer {
  private server: ReturnType<typeof TcpSocket.createServer> | null = null;
  private readonly clients = new Map<string, ConnectedClient>();

  private messageHandler?: (clientId: string, message: WsMessage) => void;
  private connectHandler?: (clientId: string) => void;
  private disconnectHandler?: (clientId: string) => void;

  start(port: number = WS_PORT): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = TcpSocket.createServer(socket => {
        const clientId = uuidv4();
        const decoder = new FrameDecoder();
        this.clients.set(clientId, {socket, decoder});
        this.connectHandler?.(clientId);

        socket.on('data', data => {
          const messages = decoder.push(data.toString());
          messages.forEach(message => {
            if (message.type === 'PING') {
              this.send(clientId, {
                type: 'PONG',
                payload: {},
                timestamp: Date.now(),
                sessionId: message.sessionId,
              });
              return;
            }
            this.messageHandler?.(clientId, message);
          });
        });

        const drop = () => {
          if (this.clients.delete(clientId)) {
            this.disconnectHandler?.(clientId);
          }
        };
        socket.on('close', drop);
        socket.on('error', drop);
      });

      this.server.on('error', (error: Error) => reject(error));
      this.server.listen({port, host: '0.0.0.0'}, () => resolve());
    });
  }

  onMessage(handler: (clientId: string, message: WsMessage) => void): void {
    this.messageHandler = handler;
  }

  onConnect(handler: (clientId: string) => void): void {
    this.connectHandler = handler;
  }

  onDisconnect(handler: (clientId: string) => void): void {
    this.disconnectHandler = handler;
  }

  send(clientId: string, message: WsMessage): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.socket.write(encodeFrame(message));
    }
  }

  broadcast(message: WsMessage): void {
    const frame = encodeFrame(message);
    this.clients.forEach(client => client.socket.write(frame));
  }

  stop(): void {
    this.clients.forEach(client => {
      try {
        client.socket.destroy();
      } catch {
        // ignore
      }
    });
    this.clients.clear();
    this.server?.close();
    this.server = null;
  }
}

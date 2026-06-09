import {FirebaseSessionSync} from '@/sync/FirebaseSessionSync';
import type {Joueur} from '@/types/joueur';

import {__resetFirebaseStore} from '../../__mocks__/firebaseRtdbStore';

describe('FirebaseSessionSync (RTDB mock en mémoire)', () => {
  beforeEach(() => {
    __resetFirebaseStore();
  });

  it('crée une session avec un code à 6 caractères', async () => {
    const host = new FirebaseSessionSync();
    const code = await host.createSession('Partie test');
    expect(code).toHaveLength(6);
    host.disconnect();
  });

  it('propage la liste des joueurs de l’hôte quand un client rejoint', async () => {
    const host = new FirebaseSessionSync();
    let players: Joueur[] = [];
    host.onPlayerList(list => {
      players = list;
    });
    const code = await host.createSession('Partie test');

    const client = new FirebaseSessionSync();
    await client.joinSession(code, 'Marco');

    expect(players.map(p => p.pseudo)).toContain('Marco');

    host.disconnect();
    client.disconnect();
  });

  it('achemine les réponses du client vers l’hôte pour la question courante', async () => {
    const host = new FirebaseSessionSync();
    const code = await host.createSession('Partie test');

    const reponses: Array<{playerId: string; option: string}> = [];
    host.onAnswer((playerId, option) => reponses.push({playerId, option}));

    const client = new FirebaseSessionSync();
    await client.joinSession(code, 'Marco');
    const clientId = client.getLocalPlayerId();

    host.broadcastQuestion({
      duelId: 'duel-1',
      index: 0,
      texte: '2 + 2 ?',
      options: ['3', '4', '5', '6'],
      deadline: Date.now() + 20000,
    });

    client.submitAnswer('duel-1', '4');

    expect(reponses).toEqual([{playerId: clientId, option: '4'}]);

    host.disconnect();
    client.disconnect();
  });

  it('diffuse le verrouillage du salon aux clients', async () => {
    const host = new FirebaseSessionSync();
    const code = await host.createSession('Partie test');

    const client = new FirebaseSessionSync();
    await client.joinSession(code, 'Marco');

    let recu = false;
    client.onLockSalon(() => {
      recu = true;
    });

    host.broadcastLockSalon(
      [],
      {rounds: [], vainqueurId: null} as never,
    );

    expect(recu).toBe(true);

    host.disconnect();
    client.disconnect();
  });
});

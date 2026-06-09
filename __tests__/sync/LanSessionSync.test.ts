import {WS_PORT} from '@/constants';
import {genererBracket} from '@/domain/bracket';
import {LanSessionSync} from '@/sync/LanSessionSync';
import type {
  DuelEndPayload,
  LockSalonPayload,
  QuestionPayload,
} from '@/sync/messages';
import type {Equipe} from '@/types/equipe';
import type {Joueur} from '@/types/joueur';
import {resetMockTcp} from '../../__mocks__/react-native-tcp-socket';

describe('LanSessionSync (intégration hôte ↔ client)', () => {
  let host: LanSessionSync;
  let client: LanSessionSync;

  beforeEach(() => {
    resetMockTcp();
    host = new LanSessionSync();
    client = new LanSessionSync();
  });

  afterEach(() => {
    client.disconnect();
    host.disconnect();
  });

  it('propage JOIN puis PLAYER_LIST à l hôte et au client', async () => {
    const hostPlayers: Joueur[][] = [];
    const clientPlayers: Joueur[][] = [];
    host.onPlayerList(players => hostPlayers.push(players));
    client.onPlayerList(players => clientPlayers.push(players));

    await host.createSession('Salon');
    await client.joinByAddress('127.0.0.1', WS_PORT, 'Bea');

    const lastHost = hostPlayers[hostPlayers.length - 1];
    const lastClient = clientPlayers[clientPlayers.length - 1];

    expect(lastHost).toHaveLength(1);
    expect(lastHost[0].pseudo).toBe('Bea');
    expect(lastClient[0].pseudo).toBe('Bea');
    expect(client.getLocalPlayerId()).not.toBeNull();
  });

  it('route la réponse du client vers l hôte avec le bon playerId', async () => {
    const answers: Array<{playerId: string; option: string}> = [];
    host.onAnswer((playerId, option) => answers.push({playerId, option}));

    await host.createSession('Salon');
    await client.joinByAddress('127.0.0.1', WS_PORT, 'Bea');

    client.submitAnswer('duel_1', 'C');

    expect(answers).toHaveLength(1);
    expect(answers[0].option).toBe('C');
    expect(answers[0].playerId).toBe(client.getLocalPlayerId());
  });

  it('diffuse LOCK_SALON, QUESTION et DUEL_END au client', async () => {
    let lock: LockSalonPayload | null = null;
    let question: QuestionPayload | null = null;
    let duelEnd: DuelEndPayload | null = null;
    client.onLockSalon(p => (lock = p));
    client.onQuestion(p => (question = p));
    client.onDuelEnd(p => (duelEnd = p));

    await host.createSession('Salon');
    await client.joinByAddress('127.0.0.1', WS_PORT, 'Bea');

    const equipes: Equipe[] = [
      {id: 'equipe_1', nom: 'Équipe 1', membres: [], bonusPoints: 0},
      {id: 'equipe_2', nom: 'Équipe 2', membres: [], bonusPoints: 0},
    ];
    const bracket = genererBracket(2);

    host.broadcastLockSalon(equipes, bracket);
    host.broadcastQuestion({
      duelId: 'match_1',
      index: 0,
      texte: 'Capitale de la France ?',
      options: ['Paris', 'Lyon', 'Nice', 'Lille'],
      deadline: Date.now() + 20000,
    });
    host.broadcastDuelEnd({
      duelId: 'match_1',
      vainqueurId: 'equipe_1',
      scoresFinaux: {
        equipeAId: 'equipe_1',
        equipeBId: 'equipe_2',
        scoreA: 6,
        scoreB: 4,
      },
    });

    expect(lock).not.toBeNull();
    expect(lock!.equipes).toHaveLength(2);
    expect(question!.texte).toBe('Capitale de la France ?');
    expect(duelEnd!.vainqueurId).toBe('equipe_1');
  });
});

import type {Bracket, Match} from '@/types/bracket';

function createMatch(
  id: string,
  roundIndex: number,
  equipeAId: string,
  equipeBId: string,
): Match {
  return {
    id,
    roundIndex,
    equipeAId,
    equipeBId,
    statut: 'pending',
  };
}

export function genererBracket(nbEquipes: number): Bracket {
  if (nbEquipes < 2 || !Number.isInteger(Math.log2(nbEquipes))) {
    throw new Error('Le nombre d équipes doit être une puissance de 2.');
  }

  const rounds: Match[][] = [];
  let matchCount = 0;

  const round1: Match[] = [];
  for (let i = 0; i < nbEquipes / 2; i += 1) {
    matchCount += 1;
    round1.push(
      createMatch(
        `match_${matchCount}`,
        0,
        `equipe_${i * 2 + 1}`,
        `equipe_${i * 2 + 2}`,
      ),
    );
  }
  rounds.push(round1);

  let previousRoundSize = round1.length;
  let roundIndex = 1;
  while (previousRoundSize > 1) {
    const round: Match[] = [];
    for (let i = 0; i < previousRoundSize / 2; i += 1) {
      matchCount += 1;
      const parentA = rounds[roundIndex - 1][i * 2];
      const parentB = rounds[roundIndex - 1][i * 2 + 1];
      round.push(
        createMatch(
          `match_${matchCount}`,
          roundIndex,
          `vainqueur_${parentA.id}`,
          `vainqueur_${parentB.id}`,
        ),
      );
    }
    rounds.push(round);
    previousRoundSize = round.length;
    roundIndex += 1;
  }

  return {nbEquipes, rounds};
}

export function avancerBracket(
  bracket: Bracket,
  matchId: string,
  vainqueurId: string,
): Bracket {
  const placeholder = `vainqueur_${matchId}`;
  let found = false;

  const rounds = bracket.rounds.map(round =>
    round.map(match => {
      if (match.id === matchId) {
        found = true;
        return {...match, vainqueurId, statut: 'completed' as const};
      }

      return {
        ...match,
        equipeAId:
          match.equipeAId === placeholder ? vainqueurId : match.equipeAId,
        equipeBId:
          match.equipeBId === placeholder ? vainqueurId : match.equipeBId,
      };
    }),
  );

  if (!found) {
    throw new Error(`Match introuvable: ${matchId}`);
  }

  return {...bracket, rounds};
}

export function getMatchsEnAttente(bracket: Bracket): Match[] {
  return bracket.rounds
    .flat()
    .filter(
      m =>
        m.statut === 'pending' &&
        !m.equipeAId.startsWith('vainqueur_') &&
        !m.equipeBId.startsWith('vainqueur_'),
    );
}

export function countMatches(bracket: Bracket): number {
  return bracket.rounds.flat().length;
}

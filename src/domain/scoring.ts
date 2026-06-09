export type MancheResult = 'A' | 'B' | 'egalite';

export interface DuelScoreInput {
  manchesA: number;
  manchesB: number;
  bonusA: number;
  bonusB: number;
  equipeAId: string;
  equipeBId: string;
}

export interface DuelWinnerResult {
  vainqueurId: string | null;
  egalite: boolean;
  scoreA: number;
  scoreB: number;
}

export function scoreMancheMajorite(
  reponsesA: boolean[],
  reponsesB: boolean[],
): MancheResult {
  const correctesA = reponsesA.filter(Boolean).length;
  const correctesB = reponsesB.filter(Boolean).length;

  if (correctesA > correctesB) {
    return 'A';
  }
  if (correctesB > correctesA) {
    return 'B';
  }
  return 'egalite';
}

export function calculerVainqueurDuel(input: DuelScoreInput): DuelWinnerResult {
  const scoreA = input.manchesA + input.bonusA;
  const scoreB = input.manchesB + input.bonusB;

  if (scoreA > scoreB) {
    return {
      vainqueurId: input.equipeAId,
      egalite: false,
      scoreA,
      scoreB,
    };
  }
  if (scoreB > scoreA) {
    return {
      vainqueurId: input.equipeBId,
      egalite: false,
      scoreA,
      scoreB,
    };
  }

  return {
    vainqueurId: null,
    egalite: true,
    scoreA,
    scoreB,
  };
}

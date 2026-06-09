import {
  calculerVainqueurDuel,
  scoreMancheMajorite,
} from '@/domain/scoring';

describe('scoreMancheMajorite', () => {
  it('attribue la manche à A avec majorité', () => {
    expect(scoreMancheMajorite([true, true, false], [true, false, false])).toBe(
      'A',
    );
  });

  it('retourne egalite si même nombre de bonnes réponses', () => {
    expect(scoreMancheMajorite([true, false], [false, true])).toBe('egalite');
  });
});

describe('calculerVainqueurDuel', () => {
  it('déclare B gagnante grâce au bonus', () => {
    const result = calculerVainqueurDuel({
      manchesA: 6,
      manchesB: 4,
      bonusA: 0,
      bonusB: 10,
      equipeAId: 'equipe_1',
      equipeBId: 'equipe_2',
    });

    expect(result.vainqueurId).toBe('equipe_2');
    expect(result.egalite).toBe(false);
    expect(result.scoreA).toBe(6);
    expect(result.scoreB).toBe(14);
  });

  it('retourne egalite si scores identiques', () => {
    const result = calculerVainqueurDuel({
      manchesA: 5,
      manchesB: 5,
      bonusA: 0,
      bonusB: 0,
      equipeAId: 'equipe_1',
      equipeBId: 'equipe_2',
    });

    expect(result.egalite).toBe(true);
    expect(result.vainqueurId).toBeNull();
  });
});

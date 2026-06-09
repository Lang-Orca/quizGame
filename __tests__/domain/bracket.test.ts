import {
  avancerBracket,
  countMatches,
  genererBracket,
} from '@/domain/bracket';

describe('genererBracket', () => {
  it('crée 7 matchs pour 8 équipes', () => {
    const bracket = genererBracket(8);

    expect(countMatches(bracket)).toBe(7);
    expect(bracket.rounds).toHaveLength(3);
    expect(bracket.rounds[0]).toHaveLength(4);
    expect(bracket.rounds[1]).toHaveLength(2);
    expect(bracket.rounds[2]).toHaveLength(1);
  });
});

describe('avancerBracket', () => {
  it('propage le vainqueur au round suivant', () => {
    const bracket = genererBracket(4);
    const match1 = bracket.rounds[0][0];

    const updated = avancerBracket(bracket, match1.id, 'equipe_1');

    expect(updated.rounds[0][0].vainqueurId).toBe('equipe_1');
    expect(updated.rounds[0][0].statut).toBe('completed');
    expect(updated.rounds[1][0].equipeAId).toBe('equipe_1');
  });
});

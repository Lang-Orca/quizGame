import {genererEquipes} from '@/domain/teams';
import type {Joueur} from '@/types/joueur';

function makeJoueurs(count: number): Joueur[] {
  return Array.from({length: count}, (_, i) => ({
    id: `j${i + 1}`,
    pseudo: `Joueur ${i + 1}`,
    connected: true,
  }));
}

describe('genererEquipes', () => {
  it('forme 4 équipes équilibrées pour 10 joueurs', () => {
    const equipes = genererEquipes(makeJoueurs(10), items => items);

    expect(equipes).toHaveLength(4);
    expect(equipes.map(e => e.membres.length).sort()).toEqual([2, 2, 3, 3]);
    expect(equipes.map(e => e.bonusPoints).sort((a, b) => a - b)).toEqual([
      0, 0, 10, 10,
    ]);
  });

  it('forme 2 équipes pour 3 joueurs', () => {
    const equipes = genererEquipes(makeJoueurs(3), items => items);

    expect(equipes).toHaveLength(2);
    expect(equipes.map(e => e.membres.length).sort()).toEqual([1, 2]);
    expect(equipes.find(e => e.membres.length === 1)?.bonusPoints).toBe(10);
  });

  it('lève une erreur avec moins de 2 joueurs', () => {
    expect(() => genererEquipes(makeJoueurs(1))).toThrow(
      'Il faut au moins 2 joueurs',
    );
  });
});

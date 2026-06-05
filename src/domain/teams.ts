import {BONUS_PAR_MEMBRE_MANQUANT, MIN_JOUEURS} from '@/constants';
import type {Equipe} from '@/types/equipe';
import type {Joueur} from '@/types/joueur';
import {shuffle} from '@/utils/shuffle';

export function genererEquipes(
  joueurs: Joueur[],
  shuffleFn: <T>(items: T[]) => T[] = shuffle,
): Equipe[] {
  const X = joueurs.length;
  if (X < MIN_JOUEURS) {
    throw new Error('Il faut au moins 2 joueurs pour démarrer.');
  }

  const N = X >= 4 ? 4 : 2;
  const equipes: Equipe[] = Array.from({length: N}, (_, i) => ({
    id: `equipe_${i + 1}`,
    nom: `Équipe ${i + 1}`,
    membres: [],
    bonusPoints: 0,
  }));

  const joueursMelanges = shuffleFn([...joueurs]);
  joueursMelanges.forEach((joueur, index) => {
    const equipe = equipes[index % N];
    equipe.membres.push({...joueur, equipeId: equipe.id});
  });

  const tailleMax = Math.max(...equipes.map(e => e.membres.length));
  equipes.forEach(equipe => {
    const membresManquants = tailleMax - equipe.membres.length;
    if (membresManquants > 0) {
      equipe.bonusPoints = membresManquants * BONUS_PAR_MEMBRE_MANQUANT;
    }
  });

  return equipes;
}

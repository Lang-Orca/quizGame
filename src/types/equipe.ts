import type {Joueur} from './joueur';

export interface Equipe {
  id: string;
  nom: string;
  membres: Joueur[];
  bonusPoints: number;
}

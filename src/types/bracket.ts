export type MatchStatut = 'pending' | 'active' | 'completed';

export interface Match {
  id: string;
  roundIndex: number;
  equipeAId: string;
  equipeBId: string;
  vainqueurId?: string;
  questionnaireId?: string;
  statut: MatchStatut;
}

export interface Bracket {
  nbEquipes: number;
  rounds: Match[][];
}

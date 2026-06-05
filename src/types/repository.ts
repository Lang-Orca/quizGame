import type {
  PartieMode,
  QuestionnaireSource,
  QuestionnaireStatut,
} from './partie';
import type {QuestionOptions} from './question';

export interface CreateQuestionInput {
  texte: string;
  options: QuestionOptions;
  reponse_correcte: string;
}

export interface CreateQuestionnaireInput {
  id: string;
  partie_id?: string | null;
  titre: string;
  source: QuestionnaireSource;
  is_public?: boolean;
  duel_id?: string | null;
  round_index?: number | null;
  questions: CreateQuestionInput[];
}

export interface QuestionnaireMeta {
  id: string;
  partie_id: string | null;
  titre: string;
  date_creation: number;
  statut: QuestionnaireStatut;
  source: QuestionnaireSource;
  is_public: boolean;
  duel_id: string | null;
  round_index: number | null;
}

export interface CreatePartieInput {
  id: string;
  nom: string;
  mode: PartieMode;
  code?: string | null;
}

export interface HistoriqueEntry {
  id: string;
  partie_id: string;
  date_partie: number;
  nom_partie: string;
  nom_questionnaire: string;
  equipe_gagnante: string;
  mode: PartieMode;
}

export interface RevealPayload {
  duelId: string;
  questionIndex: number;
  optionCorrecte: string;
  scoresManche: {equipeA: number; equipeB: number};
  mancheGagnante: 'A' | 'B' | 'egalite';
}

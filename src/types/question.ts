export type QuestionOptions = [string, string, string, string];

export interface Question {
  id: string;
  texte: string;
  options: QuestionOptions;
}

export interface QuestionWithAnswer extends Question {
  reponse_correcte: string;
}

export interface QuestionPlayerView {
  id: string;
  index_ordre: number;
  texte_question: string;
  options: QuestionOptions;
}

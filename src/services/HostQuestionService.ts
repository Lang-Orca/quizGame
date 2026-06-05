import {QuestionnaireRepository} from '@/data/sqlite/QuestionnaireRepository';
import {HOST_TOKEN} from '@/data/sqlite/hostToken';
import type {RevealPayload} from '@/types/repository';
import type {QuestionWithAnswer} from '@/types/question';
import {scoreMancheMajorite} from '@/domain/scoring';

export {HOST_TOKEN};

export class QuestionnaireVerrouilleError extends Error {
  constructor() {
    super('Questionnaire verrouillé — consultation impossible.');
    this.name = 'QuestionnaireVerrouilleError';
  }
}

export class HostQuestionService {
  private readonly repo = new QuestionnaireRepository();

  getQuestionWithAnswer(
    questionnaireId: string,
    index: number,
    partieActive = false,
  ): QuestionWithAnswer {
    if (!partieActive && !this.repo.isQuestionnaireAccessible(questionnaireId)) {
      throw new QuestionnaireVerrouilleError();
    }

    const questions = this.repo.getQuestionsForHost(questionnaireId, HOST_TOKEN);
    const question = questions.find(q => q.index_ordre === index);
    if (!question) {
      throw new Error(`Question introuvable à l index ${index}`);
    }

    return {
      id: question.id,
      texte: question.texte_question,
      options: question.options,
      reponse_correcte: question.reponse_correcte,
    };
  }

  correctPlayerAnswer(option: string, correcte: string): boolean {
    return option === correcte;
  }

  buildRevealPayload(params: {
    duelId: string;
    questionIndex: number;
    optionCorrecte: string;
    reponsesA: boolean[];
    reponsesB: boolean[];
  }): RevealPayload {
    const mancheGagnante = scoreMancheMajorite(
      params.reponsesA,
      params.reponsesB,
    );

    return {
      duelId: params.duelId,
      questionIndex: params.questionIndex,
      optionCorrecte: params.optionCorrecte,
      scoresManche: {
        equipeA: params.reponsesA.filter(Boolean).length,
        equipeB: params.reponsesB.filter(Boolean).length,
      },
      mancheGagnante,
    };
  }
}

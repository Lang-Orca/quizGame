import {z} from 'zod';

/** Schéma d'une question QCM telle que générée par l'IA. */
export const QuestionIaSchema = z
  .object({
    question: z.string().min(1),
    options: z.array(z.string().min(1)).length(4),
    reponse_correcte: z.string().min(1),
  })
  .refine(q => q.options.includes(q.reponse_correcte), {
    message: 'reponse_correcte doit correspondre à une des options',
  });

/** Schéma du questionnaire complet (tableau de QCM). */
export const QuestionnaireIaSchema = z.array(QuestionIaSchema).min(1);

export type QuestionIa = z.infer<typeof QuestionIaSchema>;
export type QuestionnaireIa = z.infer<typeof QuestionnaireIaSchema>;

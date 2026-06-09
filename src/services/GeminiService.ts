import { Question } from '../types';

const GEMINI_API_KEY = 'AQ.Ab8RN6LDuIV7_FqE7KapZNtbWYdFrLm3osYwVCgdf6cSP4ZPag';

class GeminiService {
  async generateQuestions(theme: string): Promise<Question[]> {
    try {
      const prompt = `Generate exactly 10 quiz questions about "${theme}" in French. 
      Return ONLY a valid JSON array with this exact structure (no markdown, no extra text):
      [
        {
          "question": "...",
          "choices": ["A", "B", "C", "D"],
          "answer": "A"
        }
      ]
      Requirements:
      - Each question must have exactly 4 choices
      - The answer must be one of the choices exactly as written
      - Questions should be educational and interesting
      - Mix difficulty levels
      - Return ONLY the JSON array, no other text`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates[0]?.content?.parts[0]?.text || '';

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Aucun JSON valide trouvé dans la réponse');
      }

      const questions = JSON.parse(jsonMatch[0]);

      const validatedQuestions = questions.filter(
        (q: any) =>
          q.question &&
          Array.isArray(q.choices) &&
          q.choices.length === 4 &&
          q.answer &&
          q.choices.includes(q.answer)
      );

      return validatedQuestions.slice(0, 10);

    } catch (error) {
      console.error('Erreur génération questions Gemini:', error);
      throw error;
    }
  }
}

export default new GeminiService();
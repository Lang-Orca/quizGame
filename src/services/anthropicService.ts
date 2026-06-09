import { Question } from '../types';

const ANTHROPIC_API_KEY = 'your_anthropic_api_key_here';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

class AnthropicService {
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

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content[0]?.text || '';

      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const questions = JSON.parse(jsonMatch[0]);

      // Validate questions
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
      console.error('Error generating questions from Claude:', error);
      throw error;
    }
  }
}

export default new AnthropicService();

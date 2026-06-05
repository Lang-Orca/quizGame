export interface Question {
  question: string;
  choices: string[];
  answer: string;
}

export interface QuizMode {
  type: 'offline' | 'online' | 'ai';
  category?: string;
  theme?: string;
}

export interface QuizResult {
  score: number;
  total: number;
  category: string;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

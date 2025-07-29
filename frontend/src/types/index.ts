export interface Question {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  hints: string[];
  solution: string;
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
  createdAt: string;
}

export interface Performance {
  _id: string;
  userId: string;
  questionId: Question;
  status: 'solved' | 'attempted' | 'unsolved';
  timeSpent: number;
  attempts: number;
  lastAttemptedAt: string;
  code?: string;
  notes?: string;
}

export interface PerformanceStats {
  solved: number;
  attempted: number;
  unsolved: number;
  totalTime: number;
}


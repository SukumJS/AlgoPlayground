export type Choice = {
  id: string;
  label: string;
  text: string;
};

export type Question = {
  id: string;
  question: string;
  choices: Choice[];
  correctAnswerId?: string;
};

export type QuizData = {
  id: string;
  title: string;
  questions: Question[];
};

export type UserAnswer = {
  questionId: string;
  selectedChoiceId: string | null;
};

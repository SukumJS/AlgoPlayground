export type Difficulty = "Easy" | "Medium" | "Hard";

export type TipSection = {
  label: string; // เช่น "Pseudo Code", "Key Idea"
  content: string;
};

export type Exercise = {
  title: string;
  difficulty: Difficulty;
  description: string;
  requirement: string;
  example: string;
  tips: TipSection[];
};

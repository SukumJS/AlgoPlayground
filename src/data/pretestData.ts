import { QuizData } from "@/src/app/types/quiz";

export const sampleQuizData: QuizData = {
  id: "pretest-bubblesort",
  title: "Pretest of Bubble Sort",
  questions: [
    {
      id: "q1",
      question: "What is the basic operation in Bubble Sort?",
      choices: [
        { id: "a", label: "A", text: "Comparing and swapping adjacent elements" },
        { id: "b", label: "B", text: "Dividing the array into halves" },
        { id: "c", label: "C", text: "Finding the minimum element" },
        { id: "d", label: "D", text: "Merging two sorted arrays" },
      ],
      correctAnswerId: "a",
    },
    {
      id: "q2",
      question: "When does Bubble Sort stop early?",
      choices: [
        { id: "a", label: "A", text: "When no swaps occur during a full pass" },
        { id: "b", label: "B", text: "When the largest number is found" },
        { id: "c", label: "C", text: "When the array size is even" },
        { id: "d", label: "D", text: "When a pivot is chosen" },
      ],
      correctAnswerId: "a",
    },
    {
      id: "q3",
      question: "What is the worst-case time complexity of Bubble Sort?",
      choices: [
        { id: "a", label: "A", text: "O(n)" },
        { id: "b", label: "B", text: "O(n log n)" },
        { id: "c", label: "C", text: "O(n²)" },
        { id: "d", label: "D", text: "O(log n)" },
      ],
      correctAnswerId: "c",
    },
    {
      id: "q4",
      question: "Is Bubble Sort a stable sorting algorithm?",
      choices: [
        { id: "a", label: "A", text: "Yes, it preserves the relative order of equal elements" },
        { id: "b", label: "B", text: "No, it changes the order of equal elements" },
        { id: "c", label: "C", text: "Only when sorting numbers" },
        { id: "d", label: "D", text: "It depends on the implementation" },
      ],
      correctAnswerId: "a",
    },
    {
      id: "q5",
      question: "What is the space complexity of Bubble Sort?",
      choices: [
        { id: "a", label: "A", text: "O(n)" },
        { id: "b", label: "B", text: "O(n²)" },
        { id: "c", label: "C", text: "O(1)" },
        { id: "d", label: "D", text: "O(log n)" },
      ],
      correctAnswerId: "c",
    },
  ],
};

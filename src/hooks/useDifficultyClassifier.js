import { SudokuDifficultyClassifier } from "../utils/difficultyClassifier";

const difficultyClassifier = new SudokuDifficultyClassifier();

export function useDifficultyClassifier() {
  // Simply return the singleton instance
  return {
    classifier: difficultyClassifier,
    isLoading: false
  };
}
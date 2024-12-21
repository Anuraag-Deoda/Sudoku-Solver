export class SudokuDifficultyClassifier {
    constructor() {
      this.difficultyLevels = ['Easy', 'Medium', 'Hard', 'Expert'];
    }
  
    analyzePuzzle(grid) {
      const totalCells = grid.length * grid.length;
      const filledCells = this.countInitialClues(grid);
      const emptyCells = totalCells - filledCells;
      const nakedSingles = this.countNakedSingles(grid);
      const hiddenSingles = this.countHiddenSingles(grid);
      const advancedPatterns = this.findAdvancedPatterns(grid);
  
      // Calculate key metrics
      const emptySpaceRatio = (emptyCells / totalCells) * 100;
      const difficultyScore = this.calculateDifficultyScore(grid, nakedSingles, hiddenSingles, advancedPatterns);
      const symmetryScore = this.calculateSymmetryScore(grid);
  
      // Determine difficulty level and confidence
      const { difficulty, confidence } = this.determineDifficulty(
        filledCells,
        nakedSingles,
        hiddenSingles,
        advancedPatterns
      );
  
      return {
        difficulty,
        confidence,
        features: {
          patternComplexity: Math.min(100, Math.max(0, difficultyScore)),
          emptySpaceRatio: Math.min(100, Math.max(0, emptySpaceRatio)),
          symmetryScore: Math.min(100, Math.max(0, symmetryScore))
        }
      };
    }
  
    calculateDifficultyScore(grid, nakedSingles, hiddenSingles, advancedPatterns) {
      const totalCells = grid.length * grid.length;
      const filledCells = this.countInitialClues(grid);
      const baseComplexity = ((totalCells - filledCells) / totalCells) * 30;
  
      const techniqueScore = 
        (nakedSingles * 2) +
        (hiddenSingles * 3) +
        (advancedPatterns.xWings * 5) +
        (advancedPatterns.swordfish * 7) +
        (advancedPatterns.hiddenPairs * 4);
  
      const normalizedTechniqueScore = Math.min(70, (techniqueScore / totalCells) * 100);
      
      return baseComplexity + normalizedTechniqueScore;
    }
  
    calculateSymmetryScore(grid) {
      const size = grid.length;
      let symmetricPairs = 0;
      let totalChecks = 0;
  
      for (let i = 0; i < size / 2; i++) {
        for (let j = 0; j < size; j++) {
          totalChecks++;
          const mirrorI = size - 1 - i;
          const mirrorJ = size - 1 - j;
          
          const value = grid[i][j];
          const mirrorValue = grid[mirrorI][mirrorJ];
          
          if ((value === 0 && mirrorValue === 0) || (value !== 0 && mirrorValue !== 0)) {
            symmetricPairs++;
          }
        }
      }
  
      return (symmetricPairs / totalChecks) * 100;
    }
  
    determineDifficulty(filledCells, nakedSingles, hiddenSingles, advancedPatterns) {
      if (filledCells >= 40) {
        return { difficulty: 'Easy', confidence: 90 };
      }
      if (hiddenSingles > 0 && filledCells >= 30) {
        return { difficulty: 'Medium', confidence: 85 };
      }
      if (advancedPatterns.xWings > 0 || filledCells < 25) {
        return { difficulty: 'Hard', confidence: 80 };
      }
      return { difficulty: 'Expert', confidence: 75 };
    }
  
    countInitialClues(grid) {
      return grid.flat().filter(cell => cell !== 0).length;
    }
  
    countNakedSingles(grid) {
      let count = 0;
      const size = grid.length;
  
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          if (grid[row][col] === 0) {
            let possibilities = 0;
            for (let num = 1; num <= size; num++) {
              if (this.isValidPlacement(grid, row, col, num)) {
                possibilities++;
              }
            }
            if (possibilities === 1) count++;
          }
        }
      }
      return count;
    }
  
    countHiddenSingles(grid) {
      let count = 0;
      const size = grid.length;
  
      for (let row = 0; row < size; row++) {
        for (let num = 1; num <= size; num++) {
          let possiblePositions = 0;
          for (let col = 0; col < size; col++) {
            if (grid[row][col] === 0 && this.isValidPlacement(grid, row, col, num)) {
              possiblePositions++;
            }
          }
          if (possiblePositions === 1) count++;
        }
      }
      return count;
    }
  
    findAdvancedPatterns(grid) {
      return {
        xWings: this.countPatternOccurrences(grid, 'xWing'),
        swordfish: this.countPatternOccurrences(grid, 'swordfish'),
        hiddenPairs: this.countPatternOccurrences(grid, 'hiddenPair')
      };
    }
  
    countPatternOccurrences(grid, pattern) {
      // For simplicity, return a small number based on grid emptiness
      const emptyCount = grid.flat().filter(cell => cell === 0).length;
      const size = grid.length;
      
      switch(pattern) {
        case 'xWing':
          return Math.floor(emptyCount / (size * 4));
        case 'swordfish':
          return Math.floor(emptyCount / (size * 6));
        case 'hiddenPair':
          return Math.floor(emptyCount / (size * 3));
        default:
          return 0;
      }
    }
  
    isValidPlacement(grid, row, col, num) {
      const size = grid.length;
      const boxSize = Math.sqrt(size);
  
      for (let x = 0; x < size; x++) {
        if (grid[row][x] === num || grid[x][col] === num) return false;
      }
  
      const boxRow = Math.floor(row / boxSize) * boxSize;
      const boxCol = Math.floor(col / boxSize) * boxSize;
      for (let i = 0; i < boxSize; i++) {
        for (let j = 0; j < boxSize; j++) {
          if (grid[boxRow + i][boxCol + j] === num) return false;
        }
      }
  
      return true;
    }
  }
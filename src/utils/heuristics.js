/* eslint-disable no-unused-vars */
export const findBestCell = (grid, size) => {
    let minPossibilities = size + 1;
    let bestCell = null;
    const boxSize = Math.sqrt(size);
  
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (grid[i][j] === 0) {
          const possibilities = countPossibleValues(grid, i, j, size);
          if (possibilities < minPossibilities) {
            minPossibilities = possibilities;
            bestCell = [i, j];
            // Early exit if we find a cell with minimal possibilities
            if (minPossibilities === 1) return bestCell;
          }
        }
      }
    }
    return bestCell;
  };
  
  const countPossibleValues = (grid, row, col, size) => {
    const used = new Set();
    const boxSize = Math.sqrt(size);
  
    // Check row and column
    for (let i = 0; i < size; i++) {
      used.add(grid[row][i]);
      used.add(grid[i][col]);
    }
  
    // Check box
    const boxRow = Math.floor(row / boxSize) * boxSize;
    const boxCol = Math.floor(col / boxSize) * boxSize;
    for (let i = 0; i < boxSize; i++) {
      for (let j = 0; j < boxSize; j++) {
        used.add(grid[boxRow + i][boxCol + j]);
      }
    }
  
    return size - (used.size - 1); // Subtract 1 to account for 0 in the set
  };
  
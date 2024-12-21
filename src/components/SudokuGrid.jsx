// SudokuGrid.jsx
import React from 'react';
import { motion } from 'framer-motion';

const SudokuGrid = ({ 
  grid, 
  boardSize, 
  handleCellChange, 
  isOriginal, 
  solving, 
  highlightedCell,
  userEnteredCells,
  theme 
}) => {
  const boxSize = Math.sqrt(boardSize);

  // Dynamically calculate cell size based on board size
  const getCellStyles = (size) => {
    switch(size) {
      case 4:
        return 'w-16 h-16 text-xl';
      case 16:
        return 'w-10 h-10 text-sm';
      default: // 9x9
        return 'w-12 h-12 text-lg';
    }
  };

  const cellSize = getCellStyles(boardSize);

  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
    width: 'fit-content'
  };

  return (
    <div className="flex justify-center items-center w-full overflow-x-auto">
      <div 
        style={containerStyle}
        className="gap-[1px] bg-gray-400 p-0.5 border-2 border-gray-800 rounded-lg"
      >
        {Array(boardSize).fill().map((_, i) => (
          Array(boardSize).fill().map((_, j) => (
            <motion.div
              key={`${i}-${j}`}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className={`
                relative
                ${(j + 1) % boxSize === 0 && j !== boardSize - 1 ? 'border-r-2 border-gray-800' : ''}
                ${(i + 1) % boxSize === 0 && i !== boardSize - 1 ? 'border-b-2 border-gray-800' : ''}
              `}
            >
              <input
                type="number"
                value={grid[i]?.[j] || ''}
                onChange={(e) => handleCellChange(i, j, e.target.value)}
                className={`
                  ${cellSize}
                  text-center transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  ${isOriginal[i]?.[j] ? 'text-blue-600 font-bold' : ''}
                  ${userEnteredCells[i]?.[j] && !solving ? 'text-gray-700' : ''}
                  ${userEnteredCells[i]?.[j] && solving ? 'text-blue-600 font-bold' : ''}
                  ${highlightedCell?.row === i && highlightedCell?.col === j 
                    ? highlightedCell.status === 'trying' 
                      ? 'bg-green-100' 
                      : highlightedCell.status === 'backtracking' 
                        ? 'bg-red-100'
                        : 'bg-green-200'
                    : 'bg-white hover:bg-gray-50'}
                  ${solving && !isOriginal[i]?.[j] && !userEnteredCells[i]?.[j] ? 'cursor-not-allowed' : 'cursor-text'}
                `}
                disabled={solving && !userEnteredCells[i]?.[j]}
                min="1"
                max={boardSize}
                step="1"
                inputMode="numeric"
              />
            </motion.div>
          ))
        ))}
      </div>
    </div>
  );
};

export default SudokuGrid;
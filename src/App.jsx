import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import SudokuGrid from './components/SudokuGrid';
import Controls from './components/Controls';
import ThemeSwitcher from './components/ThemeSwitcher';
import BoardSizeSelector from './components/BoardSizeSelector';
import DifficultyAnalysis from './components/DifficultyAnalysis';
import { themes } from './utils/themes';
import { SudokuDifficultyClassifier } from './utils/difficultyClassifier';
import { toast } from 'react-hot-toast';

// Create singleton instance of difficulty classifier
const difficultyClassifier = new SudokuDifficultyClassifier();

const createEmptyGrid = (size) => Array(size).fill().map(() => Array(size).fill(0));
const createEmptyOriginalGrid = (size) => Array(size).fill().map(() => Array(size).fill(false));

const EXAMPLE_PUZZLES = {
  4: [
    [1,0,0,4],
    [0,4,0,0],
    [0,0,2,0],
    [3,0,0,1]
  ],
  9: [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9]
  ],
  16: Array(16).fill().map(() => Array(16).fill(0))
};

export default function App() {
  // Core State Management
  const [boardSize, setBoardSize] = useState(9);
  const [grid, setGrid] = useState(() => createEmptyGrid(9));
  const [isOriginal, setIsOriginal] = useState(() => createEmptyOriginalGrid(9));
  const [userEnteredCells, setUserEnteredCells] = useState(() => createEmptyOriginalGrid(9));
  const [solving, setSolving] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [theme, setTheme] = useState('default');
  const [highlightedCell, setHighlightedCell] = useState(null);
  const [solvingHistory, setSolvingHistory] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [difficultyAnalysis, setDifficultyAnalysis] = useState(null);
  const [metrics, setMetrics] = useState({
    totalMoves: 0,
    backtrackCount: 0,
    timeElapsed: 0,
    startTime: null
  });

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Difficulty Analysis Effect
  useEffect(() => {
    if (grid.some(row => row.some(cell => cell !== 0))) {
      try {
        const analysis = difficultyClassifier.analyzePuzzle(grid);
        setDifficultyAnalysis(analysis);
      } catch (error) {
        console.error('Error analyzing puzzle difficulty:', error);
        setDifficultyAnalysis(null);
      }
    } else {
      setDifficultyAnalysis(null);
    }
  }, [grid]);

  const isValid = useCallback((grid, row, col, num) => {
    const boxSize = Math.sqrt(boardSize);

    for (let x = 0; x < boardSize; x++) {
      if (grid[row][x] === num || grid[x][col] === num) return false;
    }

    const boxStartRow = Math.floor(row / boxSize) * boxSize;
    const boxStartCol = Math.floor(col / boxSize) * boxSize;
    for (let i = 0; i < boxSize; i++) {
      for (let j = 0; j < boxSize; j++) {
        if (grid[boxStartRow + i][boxStartCol + j] === num) return false;
      }
    }

    return true;
  }, [boardSize]);

  const findBestCell = useCallback((grid) => {
    let minPossibilities = boardSize + 1;
    let bestCell = null;

    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (grid[i][j] === 0) {
          let possibilities = 0;
          for (let num = 1; num <= boardSize; num++) {
            if (isValid(grid, i, j, num)) possibilities++;
          }
          if (possibilities < minPossibilities) {
            minPossibilities = possibilities;
            bestCell = [i, j];
            if (possibilities === 1) return bestCell;
          }
        }
      }
    }
    return bestCell;
  }, [boardSize, isValid]);

  const handleCellChange = useCallback((row, col, value) => {
    if (solving && !userEnteredCells[row][col]) return;
    
    const newValue = value === '' ? 0 : parseInt(value);
    if (isNaN(newValue) || newValue < 0 || newValue > boardSize) return;

    setUndoStack(prev => [...prev, {
      grid: grid.map(row => [...row]),
      userEnteredCells: userEnteredCells.map(row => [...row])
    }]);
    setRedoStack([]);

    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[row][col] = newValue;
      return newGrid;
    });

    setUserEnteredCells(prev => {
      const newCells = prev.map(row => [...row]);
      newCells[row][col] = newValue !== 0;
      return newCells;
    });
  }, [solving, userEnteredCells, grid, boardSize]);

  const solveSudoku = async (grid, visual = false) => {
    const history = [];
    const maxSteps = boardSize * boardSize * boardSize;
    let stepCount = 0;

    const solve = async () => {
      if (stepCount++ > maxSteps) {
        throw new Error('Solution taking too many steps');
      }

      const bestCell = findBestCell(grid);
      if (!bestCell) return true;

      const [row, col] = bestCell;

      for (let num = 1; num <= boardSize; num++) {
        if (isValid(grid, row, col, num)) {
          grid[row][col] = num;

          if (visual) {
            setHighlightedCell({ row, col, status: 'trying' });
            setGrid([...grid.map(row => [...row])]);
            history.push({ grid: grid.map(row => [...row]), type: 'try', cell: [row, col], value: num });
            await sleep(Math.max(50, 2000 / speed));
          }

          if (await solve()) {
            if (visual) {
              setHighlightedCell({ row, col, status: 'success' });
              history.push({ grid: grid.map(row => [...row]), type: 'success', cell: [row, col], value: num });
              await sleep(1000 / speed);
            }
            return true;
          }

          grid[row][col] = 0;
          setMetrics(prev => ({ ...prev, backtrackCount: prev.backtrackCount + 1 }));

          if (visual) {
            setHighlightedCell({ row, col, status: 'backtracking' });
            setGrid([...grid.map(row => [...row])]);
            history.push({ grid: grid.map(row => [...row]), type: 'backtrack', cell: [row, col], value: 0 });
            await sleep(Math.max(50, 2000 / speed));
          }
        }
      }
      return false;
    };

    const startTime = Date.now();
    setMetrics(prev => ({ ...prev, startTime, totalMoves: 0, backtrackCount: 0 }));

    try {
      const result = await solve();
      setMetrics(prev => ({ ...prev, timeElapsed: Date.now() - startTime }));
      setSolvingHistory(history);
      return result;
    } catch (error) {
      console.error('Solving error:', error);
      toast.error('Puzzle is too complex or invalid');
      return false;
    }
  };

  const handleSolve = async (visual = false) => {
    setSolving(true);
    
    try {
      const gridCopy = grid.map(row => [...row]);
      const solved = await solveSudoku(gridCopy, visual);
      
      if (solved) {
        toast.success('Puzzle solved successfully!');
        setGrid(gridCopy);
      } else {
        toast.error('No solution exists for this puzzle');
        if (!visual) handleClear();
      }
    } catch (error) {
      console.error('Error solving puzzle:', error);
      toast.error('An error occurred while solving the puzzle');
    } finally {
      setHighlightedCell(null);
      setSolving(false);
    }
  };

  const handleSizeChange = useCallback((newSize) => {
    setBoardSize(newSize);
    setGrid(createEmptyGrid(newSize));
    setIsOriginal(createEmptyOriginalGrid(newSize));
    setUserEnteredCells(createEmptyOriginalGrid(newSize));
    setHighlightedCell(null);
    setSolvingHistory([]);
    setSolving(false);
    setUndoStack([]);
    setRedoStack([]);
    setMetrics({
      totalMoves: 0,
      backtrackCount: 0,
      timeElapsed: 0,
      startTime: null
    });
  }, []);

  const handleClear = useCallback(() => {
    setGrid(createEmptyGrid(boardSize));
    setIsOriginal(createEmptyOriginalGrid(boardSize));
    setUserEnteredCells(createEmptyOriginalGrid(boardSize));
    setHighlightedCell(null);
    setSolvingHistory([]);
    setSolving(false);
    setUndoStack([]);
    setRedoStack([]);
    setMetrics({
      totalMoves: 0,
      backtrackCount: 0,
      timeElapsed: 0,
      startTime: null
    });
    toast.success('Board cleared!');
  }, [boardSize]);

  const handleLoadExample = useCallback(() => {
    const example = EXAMPLE_PUZZLES[boardSize];
    setGrid(example);
    const newOriginal = createEmptyOriginalGrid(boardSize);
    example.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell !== 0) newOriginal[i][j] = true;
      });
    });
    setIsOriginal(newOriginal);
    setUserEnteredCells(createEmptyOriginalGrid(boardSize));
    setHighlightedCell(null);
    setSolvingHistory([]);
    setSolving(false);
    setUndoStack([]);
    setRedoStack([]);
    toast.success('Example puzzle loaded!');
  }, [boardSize]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const currentState = {
      grid: grid.map(row => [...row]),
      userEnteredCells: userEnteredCells.map(row => [...row])
    };
    
    const previousState = undoStack[undoStack.length - 1];
    setGrid(previousState.grid);
    setUserEnteredCells(previousState.userEnteredCells);
    
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, currentState]);
  }, [grid, userEnteredCells, undoStack]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const currentState = {
      grid: grid.map(row => [...row]),
      userEnteredCells: userEnteredCells.map(row => [...row])
    };
    
    const nextState = redoStack[redoStack.length - 1];
    setGrid(nextState.grid);
    setUserEnteredCells(nextState.userEnteredCells);
    
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, currentState]);
  }, [grid, userEnteredCells, redoStack]);

  // Render
 return (
    <div className={`min-h-screen bg-gradient-to-br ${themes[theme].background} py-8 px-4`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-7xl mx-auto ${themes[theme].card} p-8 rounded-xl shadow-2xl`}
      >
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className={`text-4xl font-bold bg-gradient-to-r ${themes[theme].primary} bg-clip-text text-transparent`}>
            Advanced Sudoku Solver
          </h1>
          <p className={`mt-2 text-sm ${themes[theme].text} opacity-75`}>
            Powered by AI-driven difficulty analysis
          </p>
        </motion.div>

        {/* Controls Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />
              <BoardSizeSelector currentSize={boardSize} onSizeChange={handleSizeChange} />
            </div>
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <label className={`${themes[theme].text} font-medium whitespace-nowrap`}>
                Solving Speed:
              </label>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className={`${themes[theme].text} w-12 text-sm`}>{speed}%</span>
              </div>
            </div>
          </div>

          <Controls
            onQuickSolve={() => handleSolve(false)}
            onVisualSolve={() => handleSolve(true)}
            onClear={handleClear}
            onLoadExample={handleLoadExample}
            onUndo={handleUndo}
            onRedo={handleRedo}
            solving={solving}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            theme={theme}
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sudoku Grid */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <SudokuGrid
                grid={grid}
                boardSize={boardSize}
                handleCellChange={handleCellChange}
                isOriginal={isOriginal}
                solving={solving}
                highlightedCell={highlightedCell}
                userEnteredCells={userEnteredCells}
                theme={theme}
              />
            </motion.div>
          </div>

          {/* Analysis Panel */}
          <div className="space-y-6">
            {/* Difficulty Analysis */}
            {difficultyAnalysis && (
              <DifficultyAnalysis
                analysis={difficultyAnalysis}
                theme={theme}
              />
            )}

            {/* Solving Statistics */}
            {metrics.totalMoves > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${themes[theme].card} border`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${themes[theme].text}`}>
                  Solving Statistics
                </h3>
                <div className={`space-y-2 ${themes[theme].text} text-sm`}>
                  <div className="flex justify-between">
                    <span>Total Moves:</span>
                    <span className="font-medium">{metrics.totalMoves}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Backtracks:</span>
                    <span className="font-medium">{metrics.backtrackCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Elapsed:</span>
                    <span className="font-medium">
                      {(metrics.timeElapsed / 1000).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efficiency:</span>
                    <span className="font-medium">
                      {Math.round((1 - metrics.backtrackCount / Math.max(1, metrics.totalMoves)) * 100)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Solving History */}
            {solvingHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${themes[theme].card} border`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${themes[theme].text}`}>
                  Solution Steps
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                  {solvingHistory.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        step.type === 'try' 
                          ? `${themes[theme].highlightTrying} text-green-800` 
                          : step.type === 'backtrack'
                          ? `${themes[theme].highlightBacktrack} text-red-800`
                          : `${themes[theme].highlightSuccess} text-green-900`
                      }`}
                    >
                      {step.type === 'try' 
                        ? `Trying ${step.value} at (${step.cell[0] + 1}, ${step.cell[1] + 1})`
                        : step.type === 'backtrack'
                        ? `Backtracking from (${step.cell[0] + 1}, ${step.cell[1] + 1})`
                        : `Success: ${step.value} at (${step.cell[0] + 1}, ${step.cell[1] + 1})`}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`mt-8 text-center ${themes[theme].text} text-sm`}
        >
          <p>Enter numbers (1-{boardSize}) in cells or load an example puzzle to begin.</p>
          <p className="mt-2 opacity-75">
            Use arrow keys to navigate, Delete or 0 to clear a cell.
            Press Ctrl+Z to undo and Ctrl+Y to redo.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

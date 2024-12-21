import { motion } from 'framer-motion';
// Controls.jsx
const Controls = ({ 
  onQuickSolve, 
  onVisualSolve, 
  onClear, 
  onLoadExample, 
  solving, 
  speed, 
  onSpeedChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  theme 
}) => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-4 justify-between">
          <label className="text-gray-700 font-medium whitespace-nowrap">
            Solving Speed:
          </label>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="range"
              min="1"
              max="100"
              value={speed}
              onChange={onSpeedChange}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer
                       accent-blue-600 hover:accent-blue-700 transition-all"
            />
            <span className="text-sm text-gray-600 w-12">{speed}%</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onQuickSolve}
          disabled={solving}
          className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
                   text-white rounded-lg shadow-sm hover:shadow-md 
                   disabled:from-gray-400 disabled:to-gray-500 
                   disabled:cursor-not-allowed transition-all"
        >
          Quick Solve
        </button>
        <button
          onClick={onVisualSolve}
          disabled={solving}
          className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 
                   text-white rounded-lg shadow-sm hover:shadow-md 
                   disabled:from-gray-400 disabled:to-gray-500 
                   disabled:cursor-not-allowed transition-all"
        >
          Visual Solve
        </button>
        <button
          onClick={onClear}
          disabled={solving}
          className="px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 
                   text-white rounded-lg shadow-sm hover:shadow-md 
                   disabled:from-gray-400 disabled:to-gray-500 
                   disabled:cursor-not-allowed transition-all"
        >
          Clear Board
        </button>
        <button
          onClick={onLoadExample}
          disabled={solving}
          className="px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 
                   text-white rounded-lg shadow-sm hover:shadow-md 
                   disabled:from-gray-400 disabled:to-gray-500 
                   disabled:cursor-not-allowed transition-all"
        >
          Load Example
        </button>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={onUndo}
          disabled={!canUndo || solving}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md 
                   hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 
                   disabled:cursor-not-allowed transition-all"
        >
          Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo || solving}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md 
                   hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 
                   disabled:cursor-not-allowed transition-all"
        >
          Redo
        </button>
      </div>
    </div>
  );
};

export default Controls;
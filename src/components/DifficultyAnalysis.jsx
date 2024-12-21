/* eslint-disable react/prop-types */

import React from 'react';
import { motion } from 'framer-motion';

const DifficultyAnalysis = ({ analysis, theme }) => {
  if (!analysis) return null;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Expert':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg bg-white shadow-sm border"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        AI Difficulty Analysis
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Predicted Level:</span>
          <span className={`${getDifficultyColor(analysis.difficulty)} 
            px-3 py-1 rounded-full text-sm font-medium`}>
            {analysis.difficulty}
          </span>
        </div>

        <div className="space-y-3">
          {/* Pattern Complexity */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Pattern Complexity</span>
              <span className="text-gray-700 font-medium">
                {analysis.features.patternComplexity.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, Math.max(0, analysis.features.patternComplexity))}%` 
                }}
              />
            </div>
          </div>

          {/* Empty Space Ratio */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Empty Space Ratio</span>
              <span className="text-gray-700 font-medium">
                {analysis.features.emptySpaceRatio.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, Math.max(0, analysis.features.emptySpaceRatio))}%` 
                }}
              />
            </div>
          </div>

          {/* Symmetry Score */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Symmetry Score</span>
              <span className="text-gray-700 font-medium">
                {analysis.features.symmetryScore.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, Math.max(0, analysis.features.symmetryScore))}%` 
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          Confidence Score: {analysis.confidence}%
        </div>
      </div>
    </motion.div>
  );
};

export default DifficultyAnalysis;
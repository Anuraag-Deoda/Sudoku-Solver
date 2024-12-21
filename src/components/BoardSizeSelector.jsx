const BoardSizeSelector = ({ currentSize, onSizeChange }) => {
    const availableSizes = [4, 9, 16];
    
    return (
      <div className="flex items-center gap-4 mb-6">
        <label className="text-gray-700 dark:text-gray-300">Board Size:</label>
        <select
          value={currentSize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {availableSizes.map(size => (
            <option key={size} value={size}>
              {size}x{size}
            </option>
          ))}
        </select>
      </div>
    );
  };

  export default BoardSizeSelector
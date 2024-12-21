import { themes } from "../utils/themes";

const ThemeSwitcher = ({ currentTheme, onThemeChange }) => {
    return (
      <div className="flex items-center gap-4 mb-6">
        <label className="text-gray-700 dark:text-gray-300">Theme:</label>
        <select
          value={currentTheme}
          onChange={(e) => onThemeChange(e.target.value)}
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.keys(themes).map(theme => (
            <option key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
      </div>
    );
  };

  export default ThemeSwitcher
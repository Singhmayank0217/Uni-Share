"use client"

import { useTheme } from "../../contexts/ThemeContext"
import { FiSun, FiMoon } from "react-icons/fi"

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-white hover:bg-opacity-20 focus:outline-none transition-colors"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <FiSun className="h-5 w-5 text-yellow-300" /> : <FiMoon className="h-5 w-5 text-white" />}
    </button>
  )
}

export default ThemeToggle


import { createContext, useState, useEffect, useContext } from "react"

// Create a context for theme management
const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  // Check if we're in the browser and if there's a saved theme preference
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme")
      return savedTheme || "dark" // Default to dark theme
    }
    return "dark"
  })

  // Update the theme class on the document body when theme changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Apply theme to html element (root)
      const root = document.documentElement
      root.classList.remove("light-theme", "dark-theme")
      root.classList.add(`${theme}-theme`)

      // Also apply to body for complete coverage
      document.body.classList.remove("light-theme", "dark-theme")
      document.body.classList.add(`${theme}-theme`)

      // Save theme preference to localStorage
      localStorage.setItem("theme", theme)
    }
  }, [theme])

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}


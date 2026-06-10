import { faMoon, faSun } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggle() {
    document.documentElement.classList.add("theme-transitioning");
    setTheme((t) => (t === "light" ? "dark" : "light"));
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 300);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`theme-toggle${theme === "dark" ? " dark" : ""}`}
      aria-label="Toggle theme"
    >
      <span className="theme-toggle-thumb">
        <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
      </span>
    </button>
  );
}

export default ThemeToggle;

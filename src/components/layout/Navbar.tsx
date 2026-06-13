import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Command } from "cmdk";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import duties from "../../../data/duties.json";
import { useSearch } from "../../context/SearchContext";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";
import "./CommandPalette.css";
import "./ThemeToggle.css";

const TYPE_ORDER = ["ultimate", "savage", "extreme", "criterion"] as const;

function Navbar() {
  const { open, setOpen } = useSearch();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isHome = location.pathname === "/";

  // scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // cmd keybinds
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
      if (e.key === "j" && e.ctrlKey && open) {
        e.preventDefault();
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
        );
      }
      if (e.key === "k" && e.ctrlKey && open) {
        e.preventDefault();
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
        );
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen, open]);

  // prevent page from scrolling when we scroll in the cmd
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const grouped = TYPE_ORDER.map((type) => ({
    type,
    entries: duties
      .filter((d) => d.type === type)
      .sort((a, b) => a.order - b.order),
  }));

  const handleSelect = (slug: string) => {
    setOpen(false);
    navigate(`/duty/${slug}`);
  };

  const isMac = navigator.platform.toUpperCase().includes("MAC");

  return (
    <div
      className={`navbar${scrolled ? " navbar--scrolled" : ""}${isHome ? " navbar--home" : ""}${open ? " navbar--open" : ""}`}
      style={
        scrolled
          ? {
              background: `color-mix(in srgb, var(--bg) 70%, transparent)`,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }
          : undefined
      }
      ref={ref}
    >
      <div className="navbar-inner">
        <div className="home">
          <Link to="/">aetheryte</Link>
        </div>
        <div className="right-links">
          <Link to="/resources">resources</Link>
          <ThemeToggle />
          <button
            className="cmd-trigger"
            type="button"
            onClick={() => setOpen((o) => !o)}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <span>Search</span>
            <kbd>{isMac ? "⌘ K" : "Ctrl K"}</kbd>
          </button>
        </div>
      </div>

      {open &&
        createPortal(
          <>
            <button
              type="button"
              className="cmd-overlay"
              aria-label="Close search"
              onClick={() => setOpen(false)}
              style={{
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              }}
            />
            <div className="cmd-tray">
              <Command>
                <Command.Input placeholder="Search..." autoFocus />
                <Command.List>
                  <Command.Empty>No results found.</Command.Empty>
                  {grouped.map(({ type, entries }) => (
                    <Command.Group key={type} heading={type}>
                      {entries.map((d) => (
                        <Command.Item
                          key={d.slug}
                          value={`${d.name} ${d.slug} ${d.type} ${d.aliases?.join(" ") ?? ""}`}
                          onSelect={() => handleSelect(d.slug)}
                        >
                          {d.name}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}
                </Command.List>
              </Command>
              <div className="cmd-footer">
                <span>
                  <kbd>↓</kbd>
                  <kbd>↑</kbd> navigate
                </span>
                <span>
                  <kbd>↵</kbd> open
                </span>
                <span>
                  <kbd>esc</kbd> close
                </span>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}

export default Navbar;

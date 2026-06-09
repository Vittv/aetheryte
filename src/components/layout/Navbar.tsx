import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Command } from "cmdk";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import duties from "../../../data/duties.json";
import { useSearch } from "../../context/SearchContext";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";

const TYPE_ORDER = ["ultimate", "savage", "extreme", "criterion"] as const;

function Navbar() {
  const { open, setOpen } = useSearch();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
    <div className={`navbar${scrolled ? " navbar--scrolled" : ""}`} ref={ref}>
      <div className="navbar-inner">
        <div className="home">
          <Link to="/">aetheryte</Link>
        </div>
        <div className="right-links">
          <a href="">resources</a>
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

      {open && (
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
                      value={`${d.name} ${d.slug} ${d.type}`}
                      onSelect={() => handleSelect(d.slug)}
                    >
                      {d.name}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </div>
      )}
    </div>
  );
}

export default Navbar;

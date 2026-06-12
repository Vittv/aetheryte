import { type MouseEvent, useEffect, useRef, useState } from "react";

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string>("");
  // track if the scroll was initiated by a user click
  const isClickScrolling = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (obs) => {
        // if the user clicked a link, ignore entries passing by
        // otherwise we get an inconsistent back and forth toc UI feedback
        if (isClickScrolling.current) return;

        const visible = obs.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "0px 0px -60% 0px" },
    );

    entries.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [entries]);

  const handleScroll = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();

    const element = document.getElementById(id);
    if (element) {
      // block the IntersectionObserver from tracking temporary states
      isClickScrolling.current = true;
      setActiveId(id);

      // perform the native smooth scroll
      element.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`);

      // clear any existing timeouts to avoid collisions
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // unblock the observer after the smooth scroll finishes (approx 500ms)
      timeoutRef.current = window.setTimeout(() => {
        isClickScrolling.current = false;
      }, 600);
    }
  };

  return (
    <aside className="sidebar-right">
      <h3>TABLE OF CONTENTS</h3>
      <nav>
        {entries.map(({ id, text, level }) => (
          <a
            key={id}
            href={`#${id}`}
            data-level={level}
            className={activeId === id ? "active" : ""}
            onClick={(e) => handleScroll(e, id)}
          >
            {text}
          </a>
        ))}
      </nav>
    </aside>
  );
}

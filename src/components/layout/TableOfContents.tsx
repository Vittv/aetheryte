import { useEffect, useState } from "react";

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (obs) => {
        const visible = obs.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "0px 0px -60% 0px" },
    );

    entries.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [entries]);

  return (
    <aside className="sidebar-right">
      <h3>On this page</h3>
      <nav>
        {entries.map(({ id, text, level }) => (
          <a
            key={id}
            href={`#${id}`}
            data-level={level}
            className={activeId === id ? "active" : ""}
          >
            {text}
          </a>
        ))}
      </nav>
    </aside>
  );
}

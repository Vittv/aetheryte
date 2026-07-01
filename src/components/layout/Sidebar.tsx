import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import duties from "../../../data/duties.json";

const SOURCES = {
  duty: {
    types: ["ultimate", "savage", "extreme", "criterion"] as const,
    basePath: "/duty",
    getData: () => duties,
  },
};

interface Props {
  source: keyof typeof SOURCES;
}

export default function Sidebar({ source }: Props) {
  const { types, basePath, getData } = SOURCES[source];
  const data = getData();
  const { slug } = useParams();

  const currentType = slug
    ? data.find((d) => d.slug === slug)?.type
    : undefined;

  const [openCategories, setOpenCategories] = useState<Set<string>>(() => {
    return new Set(currentType ? [currentType] : []);
  });

  useEffect(() => {
    if (currentType) {
      setOpenCategories(new Set([currentType]));
    }
  }, [currentType]);

  const toggle = (type: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  return (
    <aside className="sidebar-left">
      {types.map((type) => {
        const entries = data
          .filter((d) => d.type === type)
          .sort((a, b) => a.order - b.order);
        const isOpen = openCategories.has(type);

        return (
          <div key={type}>
            <button
              type="button"
              className="sidebar-category"
              onClick={() => toggle(type)}
            >
              <FontAwesomeIcon
                icon={faChevronRight}
                className={`sidebar-chevron${isOpen ? " open" : ""}`}
              />
              {type}
            </button>
            {isOpen && (
              <nav>
                {entries.map((d) => (
                  <NavLink
                    key={d.slug}
                    to={`${basePath}/${d.slug}`}
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    {d.name.replace(/\s*\(.*?\)$/, "")}
                  </NavLink>
                ))}
              </nav>
            )}
          </div>
        );
      })}
    </aside>
  );
}

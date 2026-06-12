import { NavLink } from "react-router-dom";
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

  return (
    <aside className="sidebar-left">
      {types.map((type) => {
        const entries = data
          .filter((d) => d.type === type)
          .sort((a, b) => a.order - b.order);
        return (
          <div key={type}>
            <h3>{type}</h3>
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
          </div>
        );
      })}
    </aside>
  );
}

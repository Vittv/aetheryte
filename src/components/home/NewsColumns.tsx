import type { NewsItem } from "../../types";

interface NewsColumnsProps {
  updates: NewsItem[];
  maintenance: NewsItem[];
}

const NewsColumns = ({ updates, maintenance }: NewsColumnsProps) => {
  return (
    <div className="updates-and-maintenance">
      <section className="news-column">
        <h2>Updates</h2>
        <div className="news-column-scroll">
          {updates.map((item) => (
            <a
              key={item.id}
              href={item.url}
              className="news-text-item"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.title}
            </a>
          ))}
        </div>
      </section>

      <section className="news-column">
        <h2>Maintenance</h2>
        <div className="news-column-scroll">
          {maintenance.map((item) => (
            <a
              key={item.id}
              href={item.url}
              className="news-text-item"
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.title}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default NewsColumns;

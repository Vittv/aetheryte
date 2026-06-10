import { useEffect, useState } from "react";
import type { NewsItem } from "../../types";

type Category = "topics" | "updates" | "maintenance";

interface NewsProps {
  topics: NewsItem[];
  updates: NewsItem[];
  maintenance: NewsItem[];
}

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "topics", label: "Topics" },
  { key: "updates", label: "Updates" },
  { key: "maintenance", label: "Maintenance" },
];

const ROTATE_INTERVAL = 12000;

function NewsSection({ topics, updates, maintenance }: NewsProps) {
  const [active, setActive] = useState<Category>("topics");
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    if (topics.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedIndex((i) => (i + 1) % Math.min(topics.length, 6));
    }, ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [topics.length]);

  const featuredTopics = topics.slice(0, 6);
  const featured = featuredTopics[featuredIndex];
  const lists: Record<Category, NewsItem[]> = {
    topics: topics,
    updates: updates ?? [],
    maintenance: maintenance ?? [],
  };
  const rest = lists[active];

  return (
    <section className="news">
      <div className="news-sidebar">
        <div className="news-banner">
          {featured ? (
            <a
              key={featuredIndex}
              href={featured.url}
              className="news-banner-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {featured.image && (
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="news-banner-img"
                />
              )}
              <div className="news-banner-body">
                <span className="news-banner-date">
                  {new Date(featured.time).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </span>
                <h3 className="news-banner-title">{featured.title}</h3>
                <p className="news-banner-desc">{featured.description}</p>
              </div>
            </a>
          ) : null}
          <div className="news-dots">
            {featuredTopics.map((topic, i) => (
              <button
                key={topic.id}
                type="button"
                className={`news-dot${featuredIndex === i ? " active" : ""}`}
                onClick={() => setFeaturedIndex(i)}
                aria-label={`Topic ${i + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="news-sidebar-footer">
          <div className="news-categories">
            {CATEGORIES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`news-category-btn${active === key ? " active" : ""}`}
                onClick={() => setActive(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="news-list">
        {rest.map((item) => (
          <a
            key={item.id}
            href={item.url}
            className="news-list-item"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="news-list-date">
              {new Date(item.time).toLocaleDateString(undefined, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </span>
            <span className="news-list-title">{item.title}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export default NewsSection;

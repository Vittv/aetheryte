import type { NewsItem } from "../../types";

interface NewsProps {
  topics: NewsItem[];
}

function NewsSection({ topics }: NewsProps) {
  return (
    <>
      <h2 className="news-header">News</h2>
      <section className="news-banner">
        {topics.map((item) => (
          <a
            key={item.id}
            href={item.url}
            className="news-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="news-card-meta">
              <span className="news-card-source">na.finalfantasyxiv.com</span>
              <span className="news-card-time">
                {new Date(item.time).toLocaleDateString()}
              </span>
            </div>
            <h3 className="news-card-title">{item.title}</h3>
            <p className="news-card-description">{item.description}</p>
          </a>
        ))}
      </section>
    </>
  );
}

export default NewsSection;

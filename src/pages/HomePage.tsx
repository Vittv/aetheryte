import { useEffect, useState } from "react";
import "./css/HomePage.css";

const CATEGORIES = ["topics", "updates", "maintenance"] as const;
type Category = (typeof CATEGORIES)[number];

interface NewsItem {
  id: string;
  title: string;
  url: string;
  description: string;
  time: string;
}

const HomePage = () => {
  const [news, setNews] = useState<Record<Category, NewsItem[]>>({
    topics: [],
    updates: [],
    maintenance: [],
  });

  useEffect(() => {
    const fetchAllNews = async () => {
      const results = await Promise.all(
        CATEGORIES.map(async (category) => {
          const response = await fetch(
            `https://lodestonenews.com/news/${category}?region=na`,
          );
          const data = await response.json();
          return { category, data };
        }),
      );

      const grouped = {} as Record<Category, NewsItem[]>;
      for (const { category, data } of results) {
        grouped[category] = data;
        console.log(data);
      }
      setNews(grouped);
    };

    fetchAllNews();
  }, []);

  return (
    <div className="home-page">
      <h2 className="news-header">News</h2>
      <section className="news-banner">
        {news.topics.map((item) => (
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

      <div className="news-columns">
        <section className="news-column">
          <h2>Updates</h2>
          <div className="news-column-scroll">
            {news.updates.map((item) => (
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
            {news.maintenance.map((item) => (
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
    </div>
  );
};

export default HomePage;

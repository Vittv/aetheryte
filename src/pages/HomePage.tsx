import { useEffect, useState } from "react";

const CATEGORIES = ["topics", "updates", "maintenance"] as const;
type Category = (typeof CATEGORIES)[number];

interface NewsItem {
  id: string;
  title: string;
  url: string;
  image: string;
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
      }
      setNews(grouped);
    };

    fetchAllNews();
  }, []);

  return (
    <div className="home-page">
      <section className="news-banner">
        {news.topics.map((item) => (
          <a
            key={item.id}
            href={item.url}
            className="news-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={item.image} alt={item.title} />
          </a>
        ))}
      </section>

      <div className="news-columns">
        <section className="news-column">
          <h2>Updates</h2>
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
        </section>

        <section className="news-column">
          <h2>Maintenance</h2>
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
        </section>
      </div>
    </div>
  );
};

export default HomePage;

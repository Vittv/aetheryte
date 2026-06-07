import { useEffect, useState } from "react";
import "./css/HomePage.css";
import CurrentContent from "../components/home/CurrentContent";
import NewsColumns from "../components/home/NewsColumns";
import NewsSection from "../components/home/NewsSection";
import ResetTimers from "../components/home/ResetTimers";
import type { NewsItem } from "../types";

const CATEGORIES = ["topics", "updates", "maintenance"] as const;
type Category = (typeof CATEGORIES)[number];

function HomePage() {
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
      <CurrentContent />
      <NewsSection topics={news.topics} />
      <NewsColumns updates={news.updates} maintenance={news.maintenance} />
      <ResetTimers />
    </div>
  );
}

export default HomePage;

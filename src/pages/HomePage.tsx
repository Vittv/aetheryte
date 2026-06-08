import { useEffect, useState } from "react";
import { useSearch } from "../context/SearchContext";
import "./css/HomePage.css";
import NewsColumns from "../components/home/NewsColumns";
import NewsSection from "../components/home/NewsSection";
import ResetTimers from "../components/home/ResetTimers";
import type { NewsItem } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const CATEGORIES = ["topics", "updates", "maintenance"] as const;
type Category = (typeof CATEGORIES)[number];

function HomePage() {
  const [news, setNews] = useState<Record<Category, NewsItem[]>>({
    topics: [],
    updates: [],
    maintenance: [],
  });

  const isMac = navigator.platform.toUpperCase().includes("MAC");
  const { setOpen } = useSearch();

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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hero-search"
      >
        <FontAwesomeIcon className="hero-mag-glass" icon={faMagnifyingGlass} />
        <span>Search duty guides, resources... </span>
        <kbd>{isMac ? "⌘ K" : "Ctrl K"}</kbd>
      </button>
      <NewsSection topics={news.topics} />
      <NewsColumns updates={news.updates} maintenance={news.maintenance} />
      <ResetTimers />
    </div>
  );
}

export default HomePage;

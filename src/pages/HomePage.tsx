import { useEffect, useState } from "react";
import { useSearch } from "../context/SearchContext";
import "./HomePage.css";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import vittKiSprite from "../assets/sprites/vitt-ki-sprite.png";
import type { NewsItem } from "../types";
import { CommitList } from "./home/CommitList";
import NewsSection from "./home/NewsSection";
import ResetTimers from "./home/ResetTimers";

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
    document.body.classList.add("page-home");
    return () => document.body.classList.remove("page-home");
  }, []);

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
      <div className="hero">
        <div className="hero-title">
          <h1>aetheryte</h1>
          <p>xiv resources</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hero-search"
      >
        <FontAwesomeIcon className="hero-mag-glass" icon={faMagnifyingGlass} />
        <span>Search guides, tools, resources... </span>
        <kbd>{isMac ? "⌘ K" : "Ctrl K"}</kbd>
        <img
          src={vittKiSprite}
          alt="vitt-ki-sprite"
          className="hero-search-image"
        />
      </button>
      <NewsSection
        topics={news.topics}
        updates={news.updates}
        maintenance={news.maintenance}
      />
      <ResetTimers />
      <CommitList />
    </div>
  );
}

export default HomePage;

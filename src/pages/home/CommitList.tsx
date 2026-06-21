import { useEffect, useState } from "react";
import "./CommitList.css";

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

const REPO = "Vittv/aetheryte";

export function CommitList() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.github.com/repos/${REPO}/commits?per_page=10`)
      .then((res) => res.json())
      .then((data) => {
        setCommits(
          data.map((c: any) => ({
            sha: c.sha.slice(0, 7),
            message: c.commit.message.split("\n")[0], // first line only
            author: c.commit.author.name,
            date: c.commit.author.date.slice(0, 10),
            url: c.html_url,
          })),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading commits...</p>;

  return (
    <div className="commit-list-wrapper">
      <div className="commit-list-header">
        <span>Change Log</span>
        <a
          href={`https://github.com/${REPO}/commits/main`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub →
        </a>
      </div>
      <div className="commit-list">
        {commits.map((c) => (
          <a
            key={c.sha}
            href={c.url}
            className="commit-list-item"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="commit-list-date">
              {new Date(c.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </span>
            <span className="commit-list-title">{c.message}</span>
            <span className="commit-list-meta">
              {c.sha} · {c.author}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

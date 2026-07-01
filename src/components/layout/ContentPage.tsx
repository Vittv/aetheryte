import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import "./ContentPage.css";
import duties from "../../../data/duties.json";
import { mdxComponents } from "../MDXComponents.tsx";

interface OutletContext {
  setToc: (entries: { id: string; text: string; level: number }[]) => void;
}

interface Props {
  source: "duty" | "guide";
}

const mdxModules = import.meta.glob("/src/pages/content/duty/**/*.mdx");

export default function ContentPage({ source }: Props) {
  const { setToc } = useOutletContext<OutletContext>();
  const { slug } = useParams();
  const entry =
    source === "duty" ? duties.find((d) => d.slug === slug) : undefined;

  const [loaded, setLoaded] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    if (!entry || !slug) return;

    let cancelled = false;
    const path = `/src/pages/content/duty/${entry.type}/${slug}.mdx`;
    const importer = mdxModules[path];

    if (!importer) {
      setLoaded(<div>Content unavailable</div>);
      return;
    }

    importer().then((mod) => {
      if (cancelled) return;
      const Component = (mod as { default: React.ComponentType<any> }).default;
      setLoaded(<Component dutyData={entry} components={mdxComponents} />);
    });

    return () => {
      cancelled = true;
    };
  }, [entry, slug]);

  useEffect(() => {
    const main = document.querySelector(".content-main");
    if (!main) return;

    const observer = new MutationObserver(() => {
      const headings = Array.from(main.querySelectorAll("h2")).map((el) => ({
        id: el.id,
        text: el.textContent ?? "",
        level: 2,
      }));

      if (headings.length > 0 && headings.every((h) => h.id && h.text)) {
        setToc(headings);
      }
    });

    observer.observe(main, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [slug, setToc]);

  if (!entry) return <div>Not found</div>;

  return (
    <div
      style={{
        width: "100%",
        minHeight: "calc(100vh - var(--navbar-height) - 4rem)",
      }}
    >
      {loaded}
    </div>
  );
}

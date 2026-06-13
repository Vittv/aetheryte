import { lazy, Suspense, useEffect, useMemo } from "react";
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

  const MDXContent = useMemo(() => {
    if (!entry) return null;

    interface MDXProps {
      fightData: typeof entry;
      components: typeof mdxComponents;
    }

    return lazy<React.ComponentType<MDXProps>>(() => {
      const path = `/src/pages/content/duty/${entry.type}/${slug}.mdx`;
      const importer = mdxModules[path];

      if (!importer) {
        return Promise.resolve({
          default: (() => (
            <div>Content unavailable</div>
          )) as React.ComponentType<MDXProps>,
        });
      }

      return importer() as Promise<{ default: React.ComponentType<MDXProps> }>;
    });
  }, [entry, slug]);

  useEffect(() => {
    let attempts = 0;

    const scrapeHeadings = () => {
      const headings = Array.from(
        document.querySelectorAll(".content-main h2, .content-main h3"),
      ).map((el) => ({
        id: el.id,
        text: el.textContent ?? "",
        level: el.tagName === "H2" ? 2 : 3,
      }));

      const hasValidHeadings =
        headings.length > 0 && headings.every((h) => h.id && h.text);

      if (hasValidHeadings) {
        setToc(headings);
        return true;
      }
      return false;
    };

    const initialTimeout = setTimeout(() => {
      if (scrapeHeadings()) return;

      const interval = setInterval(() => {
        attempts++;
        if (scrapeHeadings() || attempts > 10) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }, 100);

    return () => {
      clearTimeout(initialTimeout);
    };
  }, [slug, setToc]);

  if (!entry) return <div>Not found</div>;
  if (!MDXContent) return null;

  return (
    <div key={slug} style={{ width: "100%", height: "100%" }}>
      <Suspense fallback={null}>
        <MDXContent fightData={entry} components={mdxComponents} />
      </Suspense>
    </div>
  );
}

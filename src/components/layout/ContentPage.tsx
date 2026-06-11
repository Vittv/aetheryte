import { lazy, Suspense, useMemo } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import HeadingScraper from "../utils/HeadingScraper";
import "./ContentPage.css";
import duties from "../../../data/duties.json";
import { mdxComponents } from "../MDXComponents.tsx";

interface OutletContext {
  setToc: (entries: { id: string; text: string; level: number }[]) => void;
}

interface Props {
  source: "duty" | "guide";
}

const modules = import.meta.glob("../../pages/content/duty/**/*.mdx");

export default function ContentPage({ source }: Props) {
  const { setToc } = useOutletContext<OutletContext>();
  const { slug } = useParams();
  const entry = source === "duty" ? duties.find((d) => d.slug === slug) : undefined;
  if (!entry) return <div>Not found</div>;

  const path = `../../pages/content/duty/${entry.type}/${slug}.mdx`;
  const MDXContent = useMemo(
    () =>
      lazy(() => {
        const importer = modules[path];
        if (!importer) throw new Error(`No MDX found for ${path}`);
        return importer() as Promise<{ default: React.ComponentType<any> }>;
      }),
    [path],
  );

  const scrape = () => {
    const headings = Array.from(
      document.querySelectorAll(".content-main h2, .content-main h3"),
    ).map((el) => ({
      id: el.id,
      text: el.textContent ?? "",
      level: el.tagName === "H2" ? 2 : 3,
    }));
    setToc(headings);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MDXContent fightData={entry} components={mdxComponents} />
      <HeadingScraper onMount={scrape} />
    </Suspense>
  );
}

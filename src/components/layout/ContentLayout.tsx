// layouts/ContentLayout.tsx

import { useState } from "react";
import { Outlet } from "react-router-dom";
import TableOfContents from "./TableOfContents";
import "./css/ContentLayout.css";

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

interface Props {
  sidebar: React.ReactNode;
}

export default function ContentLayout({ sidebar }: Props) {
  const [toc, setToc] = useState<TocEntry[]>([]);
  return (
    <div className="content-layout">
      {sidebar}
      <main className="content-main">
        <Outlet context={{ setToc }} />
      </main>
      <TableOfContents entries={toc} />
    </div>
  );
}

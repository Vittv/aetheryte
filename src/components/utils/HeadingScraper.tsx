import { useEffect } from "react";

function HeadingScraper({ onMount }: { onMount: () => void }) {
  useEffect(() => {
    onMount();
  }, []);
  return null;
}

export default HeadingScraper;

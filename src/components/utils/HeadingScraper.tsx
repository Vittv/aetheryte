import { useEffect } from "react";

function HeadingScraper({ onMount }: { onMount: () => void }) {
  useEffect(() => {
    onMount();
  }, [onMount]);
  return null;
}

export default HeadingScraper;

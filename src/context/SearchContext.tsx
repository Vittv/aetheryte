import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useState } from "react";

interface SearchContextType {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SearchContext.Provider value={{ open, setOpen }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within a SearchProvider");
  return ctx;
}

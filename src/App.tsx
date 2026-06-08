import { Outlet } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import { SearchProvider } from "./context/SearchContext";

function App() {
  return (
    <SearchProvider>
      <Navbar />
      <Outlet />
      <Footer />
    </SearchProvider>
  );
}

export default App;

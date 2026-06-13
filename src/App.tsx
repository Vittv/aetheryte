import { Outlet } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import ScrollToTop from "./components/utils/ScrollToTop";
import { SearchProvider } from "./context/SearchContext";
import NavigationProgress from "./components/NavigationProgress";

function App() {
  return (
    <SearchProvider>
      <NavigationProgress />
      <ScrollToTop />
      <Navbar />
      <Outlet />
      <Footer />
    </SearchProvider>
  );
}

export default App;

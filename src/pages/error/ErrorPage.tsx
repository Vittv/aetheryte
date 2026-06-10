import Footer from "../../components/layout/Footer";
import Navbar from "../../components/layout/Navbar";
import { SearchProvider } from "../../context/SearchContext";

const ErrorPage = () => {
  return (
    <SearchProvider>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100svh",
        }}
      >
        <Navbar />
        <main style={{ flex: 1 }}>
          <p>Kupo? Page not found, kupo!</p>
        </main>
        <Footer />
      </div>
    </SearchProvider>
  );
};

export default ErrorPage;

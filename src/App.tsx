import { Outlet } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";

import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

export default App;

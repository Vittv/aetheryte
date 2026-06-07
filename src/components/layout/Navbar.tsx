import { Link } from "react-router-dom";
import "./css/Navbar.css";

function Navbar() {
  return (
    <div className="navbar">
      <div className="navbar-inner">
        <div className="home">
          <Link to="/">aetheryte</Link>
        </div>
        <div className="right-links">
          <a href="">duty</a>
          <a href="">resources</a>
        </div>
      </div>
    </div>
  );
}

export default Navbar;

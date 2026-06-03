import { Link } from "react-router-dom";
import "./css/Navbar.css";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="home">
        <Link to="/">aetheryte</Link>
      </div>
      <div className="right-links"></div>
    </div>
  );
};

export default Navbar;

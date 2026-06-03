import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./css/Footer.css";

const Footer = () => {
  return (
    <div className="footer">
      <div className="contact-and-address">
        <p>
          <FontAwesomeIcon className="fa-icon" icon={faGithub} />
          <a
            href="https://github.com/Vittv/aetheryte"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vittv
          </a>
        </p>
      </div>
    </div>
  );
};

export default Footer;

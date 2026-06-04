import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./css/Footer.css";

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <p>
            FINAL FANTASY is a registered trademark of Square Enix Holdings Co.,
            Ltd. ©{" "}
          </p>
          <p>
            SQUARE ENIX CO., LTD. All Rights Reserved | All content © their
            respective authors
          </p>
        </div>
        <div className="footer-right">
          <p>
            <FontAwesomeIcon className="fa-icon" icon={faGithub} />
            <a
              href="https://github.com/Vittv/aetheryte"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;

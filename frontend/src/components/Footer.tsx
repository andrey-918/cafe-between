import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-section">
            <Link to="/" className="footer-title">TheCafé</Link>
            <p className="footer-text">Пространство между кофе и культурой</p>
          </div>

          <div className="footer-section">
            <h2 className="footer-subtitle">Исследуйте</h2>
            <div className="footer-links">
              <Link to="/menu" className="footer-link">Меню</Link>
              <Link to="/news" className="footer-link">События</Link>
            </div>
          </div>

          <div className="footer-section">
            <h2 className="footer-subtitle">На связи</h2>
            <a href="https://t.me/andrey_918" className="footer-link" target="_blank" rel="noreferrer">
              Написать в Telegram ↗
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {new Date().getFullYear()} TheCafé
            </p>
            <span className="footer-note">Кофе, искусство и люди</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const FooterComponent = () => <Footer />;
export default FooterComponent;

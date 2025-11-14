export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          {/* About */}
          <div className="footer-section">
            <h3 className="footer-title">BETWEEN</h3>
            <p className="footer-text">
              Пространство между кофе и культурой
            </p>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Контакты</h4>
            <div className="footer-text">
              <p>ул. Пушкина, 15</p>
              <p>Москва, 101000</p>
              <p className="footer-text-spacing">+7 (495) 123-45-67</p>
              <p>hello@between.cafe</p>
            </div>
          </div>

          {/* Hours */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Время работы</h4>
            <div className="footer-text">
              <p>Понедельник - Пятница</p>
              <p>8:00 - 22:00</p>
              <p className="footer-text-spacing">Суббота - Воскресенье</p>
              <p>10:00 - 23:00</p>
            </div>
          </div>

          {/* Social */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Социальные сети</h4>
            <div className="footer-links">
              <a href="#" className="footer-link">Instagram</a>
              <a href="#" className="footer-link">Facebook</a>
              <a href="#" className="footer-link">VK</a>
              <a href="#" className="footer-link">Telegram</a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © 2025 BETWEEN. Все права защищены
            </p>
            <div className="footer-legal">
              <a href="#" className="footer-legal-link">Политика конфиденциальности</a>
              <a href="#" className="footer-legal-link">Условия использования</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

const FooterComponent = () => <Footer />;
export default FooterComponent;

import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleHomeClick = () => {
    sessionStorage.removeItem('homeScrollPosition');
    window.scrollTo(0, 0);
    closeMenu();
  };

  const handleMenuClick = () => {
    sessionStorage.removeItem('menuScrollPosition');
    window.scrollTo(0, 0);
    closeMenu();
  };

  const handleNewsClick = () => {
    sessionStorage.removeItem('newsScrollPosition');
    window.scrollTo(0, 0);
    closeMenu();
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <Link to="/" className="logo-link" onClick={closeMenu}>
            <span className="logo-text">TheCafé</span>
          </Link>

          <nav className="nav" aria-label="Основная навигация">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Главная</NavLink>
            <NavLink to="/news" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={handleNewsClick}>События</NavLink>
            <NavLink to="/menu" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={handleMenuClick}>Меню</NavLink>
            {isAuthenticated && (
              <>
                <Link to="/admin/menu" className="nav-link">Редактировать меню</Link>
                <Link to="/admin/news" className="nav-link">Редактировать события</Link>
                <button onClick={handleLogout} className="nav-link logout-btn">Выйти</button>
              </>
            )}
          </nav>

          <button
            className="nav-toggle"
            onClick={() => setIsMenuOpen(open => !open)}
            aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            <svg className="nav-toggle-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          <nav id="mobile-navigation" className={`nav-menu mobile ${isMenuOpen ? 'open' : ''}`} aria-label="Мобильная навигация" aria-hidden={!isMenuOpen}>
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={handleHomeClick}>Главная</NavLink>
            <NavLink to="/news" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={handleNewsClick}>События</NavLink>
            <NavLink to="/menu" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={handleMenuClick}>Меню</NavLink>
            {isAuthenticated && (
              <>
                <Link to="/admin/menu" className="nav-link" onClick={closeMenu}>Редактировать меню</Link>
                <Link to="/admin/news" className="nav-link" onClick={closeMenu}>Редактировать события</Link>
                <button onClick={handleLogout} className="logout-btn">Выйти</button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

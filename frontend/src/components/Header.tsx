import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <Link to="/" className="logo-link">
            <span className="logo-text">BETWEEN</span>
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">Главная</Link>
            <Link to="/news" className="nav-link">События</Link>
            <Link to="/menu" className="nav-link">Меню</Link>
            {isAuthenticated && (
              <>
                <Link to="/admin/menu" className="nav-link">Редактировать меню</Link>
                <Link to="/admin/news" className="nav-link">Редактировать события</Link>
                <button onClick={handleLogout} className="nav-link logout-btn">Выйти</button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header>
      <img src="/info/logo.jpeg" alt="Cafe Between Logo" className="logo" />
      <nav>
        <Link to="/" className="nav-link">Главная</Link>
        <Link to="/menu" className="nav-link">Меню</Link>
        <Link to="/news" className="nav-link">Новости</Link>
        {isAuthenticated ? (
          <>
            <Link to="/admin/menu" className="nav-link">Админ Меню</Link>
            <Link to="/admin/news" className="nav-link">Админ Новости</Link>
            <button onClick={handleLogout} className="logout-btn">Выйти</button>
          </>
        ) : (
          <Link to="/login" className="nav-link">Войти</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
